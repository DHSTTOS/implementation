import { userStore, dataStore } from '@stores';

let msgIdCounter = 0;
let msgRegister = [];

const createConnection = () => {
  // XXX should we check for an existing connection, and if so, close it?
  // Or maybe in the future we might have multiple connections to multiple servers?
  //
  let newSocket = new WebSocket(userStore.wsEndpointURL);
  initHandlers(newSocket);

  msgIdCounter = 0;
  msgRegister = [];
  return newSocket;
};

// as long as we keep these socket.something listener assignments within the same scope
// as the socket construction, we won't miss the 'open' event etc.

const initHandlers = socket => {
  socket.onopen = message => {
    console.log('WebSocket onopen fired: ', message);
    // authenticate again when opening socket
    // XXX i.e. this should call auth()
    // XXX but for now (debugging the main page alone) use login
    login(
      socket,
      userStore.userDetails.userName,
      userStore.userDetails.password
    );
  };

  socket.onerror = message => {
    console.error('WebSocket onerror fired: ', message);
  };

  socket.onclose = message => {
    console.groupCollapsed('WebSocket onclose fired');
    console.dir(message);
    let echoText = 'Disconnect: ' + message;
    echoText += ', ' + message.code;
    echoText += ', ' + message.reason;
    echoText += ', ' + message.wasClean;
    echoText += ', ' + message.isTrusted;
    echoText += '\n';
    console.log(echoText);
    console.groupEnd();

    // TODO XXX: if logout was called (intentional) then do nothing (stay logged out),
    // else try to open the connection again and login again, with token
  };

  socket.onmessage = message => {
    console.group('WebSocket onmessage fired');
    console.dir(message);
    handleMessage(JSON.parse(message.data));
    console.groupEnd();
  };
};

/*
 * Take the JSON-formatted message and handle it according to the protocol.
 */
const handleMessage = msg => {
  console.groupCollapsed(`Handling ${msg.cmd} response ID ${msg.id}`);
  console.table(msg.par);
  if (!msgRegister[msg.id]) {
    console.warn('Protocol: bug: this message was unrequested');
  }

  switch (msg.cmd) {
    case 'SESSION':
      handleSession(msg);
      break;
    // // deprecated
    // case 'LIST_COLL':
    //   // msg.par will be array
    //   dataStore.sourceOptions = msg.par;
    //   break;
    case 'LIST_COLL_GROUPS':
      dataStore.sourceOptions = msg.par.length && msg.par.map(x => x[0]);
      break;
    case 'COLL_SIZE':
      break;
    case 'DATA_ENDPOINTS':
      handleDataEndpoints(msg);
      break;
    case 'DATA':
      handleData(msg);
      break;
    case 'DATAGROUP':
      handleDataGroup(msg);
      break;
    case 'DATAGROUP_ENDPOINTS':
      handleDataGroupEndpoints(msg);
      break;
    default:
      console.error('error: unknown request from server: ' + msg.cmd);
      break;
  }
  console.groupEnd();

  // Now that msg has been handled, delete its request:
  delete msgRegister[msg.id];
};

// Handle data below
const handleDataEndpoints = msg => {
  dataStore.availableCollections = msg.par;
  if (collName.indexOf('_') > -1) {
    dataStore.alarms[collName].endpoints = msg.data;
  } else {
    dataStore.endpoints = msg.data;
  }
};

const handleData = msg => {
  console.log('Received data message: ' + msg.data.length + ' ' + msg.data[0]);
  if (!msgRegister[msg.id]) {
    console.log(
      'Protocol: bug: received unrequested message, dropping it: ' + msg
    );
    return;
  }
  let context = msgRegister[msg.id]; // the request that triggered this msg
  let collName = context.par;
  if (collName.indexOf('_') > -1) {
    dataStore.alarms[collName].data = {
      name: collName,
      keys: Object.keys(msg.data[0]), // XXX: if data empty and this existed already, should we copy the old keys instead of overwriting with []?
      data: msg.data,
    };
  } else {
    dataStore.rawData = msg.data;
    const { _id, L2Protocol, L3Protocol, L4Protocol, ...keys } = Object.keys(
      msg.data[0]
    );
    dataStore.availableKeys = keys;
  }
  // TODO: remove msgRegister[msg.id]

  console.log('Updated data store:');
  console.log(dataStore.data.length + ' ' + dataStore.data[0]);
};

const handleDataGroup = msg => {
  const baseName = msg.name;
  const rawDataPayload = msg.par.find(x => x.name === baseName);
  const rawData = rawDataPayload.data.map(x => JSON.parse(x));
  dataStore.rawData = rawData;
  const { _id, L2Protocol, L3Protocol, L4Protocol, ...keys } = Object.keys(
    rawData[0]
  );
  dataStore.availableKeys = keys;
  dataStore.endpoints = [0, rawDataPayload.size];

  // XXX This hardcoded handling of the processed data should be made more flexible:
  dataStore.addressesAndLinksData = msg.par
    .find(x => x.name === baseName + '_AddressesAndLinks')
    .data.map(x => JSON.parse(x));

  dataStore.flowrateData = msg.par
    .find(x => x.name === baseName + '_FlowRatePerSecond')
    .data.map(x => JSON.parse(x));

  dataStore.connectionNumberData = msg.par
    .find(x => x.name === baseName + '_NumberOfConnectionsPerNode')
    .data.map(x => JSON.parse(x));
};

/**
 * Sets dataStore.totalEndpoints to a list of {startrecord, endrecord}
 * for each collection listed in the message.
 * Note: these are the start and endpoint of a collection as it is
 * on the server. The data stored in dataStore.rawdata etc. may be
 * only a shorter section.
 * I.e. these endpoint may lay beyond the record arrays in
 * dataStore.rawdata etc.
 * They're used for the scales and axes.
 *
 * @param msg
 */
const handleDataGroupEndpoints = msg => {
  let tmp = [];
  for (let coll in msg.par) {
    tmp[coll.name] = {
      start: JSON.parse(coll.start),
      end: JSON.parse(coll.end),
    };
    dataStore.totalEndpoints = tmp;
  }
};

const handleSession = async msg => {
  switch (msg.par) {
    case 'LOGIN':
      if (msg.status === 'OK') {
        await localStorage.setItem('token', msg.token);
        userStore.userDetails.wsLoggedIn = true;
      } else {
        // TODO: present the login screen again, with a "Username or password wrong" notice
      }
      break;
    case 'AUTH':
      if (msg.status !== 'OK') {
        console.log('websocket connection: AUTHentication failed:');
        console.dir(msg);
        userStore.userDetails.wsLoggedIn = true;
      }
      break;
    case 'LOGOUT':
      await localStorage.removeItem('token');
      userStore.userDetails.wsLoggedIn = false;
      break;
    default:
      console.log('Protocol error: got unknown SESSION message:');
      console.dir(msg);
      break;
  }
};

/***
 * Takes a message object, adds the id, registers it, and sends it.
 * @param {any} message
 * @param {WebSocket} socket
 * @returns {undefined}
 */
const sendRequest = (socket, message) => {
  message.id = msgIdCounter++;
  msgRegister[message.id] = message;
  socket.send(JSON.stringify(message));
};

const login = (socket, name, password) => {
  const message = {
    cmd: 'LOGIN',
    user: name,
    pwd: password,
  };
  sendRequest(socket, message);
};

const auth = (socket, name, token) => {
  const message = {
    cmd: 'AUTH',
    user: name,
    token: token,
  };
  sendRequest(socket, message);
};

const logout = socket => {
  const message = {
    cmd: 'LOGOUT',
  };
  sendRequest(socket, message);
};

/**
 * @deprecated
 * @param {WebSocket} socket
 */
const getAvailableCollections = socket => {
  const message = {
    cmd: 'GET_AV_COLL',
  };
  sendRequest(socket, message);
};

const getCollectionGroups = socket => {
  const message = {
    cmd: 'GET_COLL_GROUPS',
  };
  sendRequest(socket, message);
};

const getCollectionGroupData = (socket, name) => {
  const message = {
    cmd: 'GET_COLL_GROUP_DATA',
    par: name,
  };
  sendRequest(socket, message);
};

const getCollectionGroupEndpoints = (socket, name) => {
  const message = {
    cmd: 'GET_COLL_GROUP_ENDPOINTS',
    par: name,
  };
  sendRequest(socket, message);
};

const getCollection = (socket, name) => {
  const message = {
    cmd: 'GET_COLL',
    par: name,
  };
  sendRequest(socket, message);
};

const getCollectionSize = (socket, name) => {
  const message = {
    cmd: 'GET_COLL_SIZE',
    par: name,
  };
  sendRequest(socket, message);
};

const getEndpoints = (socket, name) => {
  const message = {
    cmd: 'GET_ENDPOINTS',
    par: name,
  };
  sendRequest(socket, message);
};

const getRecord = (socket, name, key, value) => {
  const message = {
    cmd: 'GET_RECORD',
    par: name,
    key: key,
    value: value,
  };
  sendRequest(socket, message);
};

const getRecordsInRange = (socket, name, key, startValue, endValue) => {
  const message = {
    cmd: 'GET_RECORDS_RANGE',
    par: name,
    key: key,
    start: startValue,
    end: endValue,
  };
  sendRequest(socket, message);
};

const getRecordsInRangeSize = (socket, name, key, startValue, endValue) => {
  const message = {
    cmd: 'GET_RECORDS_RANGE_SIZE',
    par: name,
    key: key,
    start: startValue,
    end: endValue,
  };
  sendRequest(socket, message);
};

// Get a collection from local storage. If no name given, return the raw data as a pseudo collection.
const getLocalCollection = collName => {
  if (collName === '') {
    return {
      name: '',
      keys: [
        'L2Protocol',
        'SourceMACAddress',
        'L4Protocol',
        'SourceIPAddress',
        'PacketSummary',
        'PacketID',
        'DestinationIPAddress',
        'Timestamp',
        'DestinationPort',
        'SourcePort',
        'L3Protocol',
        'DestinationMACAddress',
      ],
      data: dataStore.rawData,
    };
  } else {
    return dataStore.alarms[collName];
  }
};

// Get the data of the specified collection from local storage. Returns an array of JSON strings representing the datapoints.
const getLocalCollectionData = collName => {
  if (collName === '') {
    return dataStore.rawData;
  } else {
    return dataStore.alarms[collName].data;
  }
};

export {
  createConnection,
  login,
  auth,
  logout,
  getAvailableCollections,
  getCollectionGroups,
  getCollectionGroupData,
  getCollectionGroupEndpoints,
  getCollection,
  getCollectionSize,
  getEndpoints,
  getRecord,
  getRecordsInRange,
  getRecordsInRangeSize,
  getLocalCollection,
  getLocalCollectionData,
};
