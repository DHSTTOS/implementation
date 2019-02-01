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
    console.log('WebSocket onopen: ', message);
    console.dir(message);

    // authenticate again when opening socket
    loginToken(
      socket,
      userStore.userDetails.userName,
      userStore.userDetails.password
    );
  };

  socket.onerror = message => {
    console.log('WebSocket onerror: ', message);
    console.dir(message);
  };

  socket.onclose = message => {
    console.log('WebSocket onclose:');
    console.dir(message);
    let echoText = 'Disconnect: ' + message;
    echoText += ', ' + message.code;
    echoText += ', ' + message.reason;
    echoText += ', ' + message.wasClean;
    echoText += ', ' + message.isTrusted;
    echoText += '\n';
    console.log(echoText);

    // TODO XXX: if logout was called (intentional) then do nothing (stay logged out),
    // else try to open the connection again and login again, with token
  };

  socket.onmessage = message => {
    console.log('WebSocket onmessage: ');
    console.dir(message);
    handleMessage(JSON.parse(message.data));
  };
};

/*
 * Take the JSON-formatted message and handle it according to the protocol.
 */
const handleMessage = msg => {
  console.log(msg);
  switch (msg.cmd) {
    case 'SESSION':
      handleSession(msg);
      break;
    case 'LIST_COL':
      // msg.par will be array
      dataStore.availableCollections = msg.par;
      break;
    case 'COLL_SIZE':
      break;
    case 'DATA':
      handleData(msg);
      break;
    default:
      console.log('error: unknown request from server: ' + msg.cmd);
      break;
  }
};

// Handle data below
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
    dataStore.availableKeys = Object.keys(msg.data[0]);
  }
  // TODO: remove msgRegister[msg.id]

  console.log('Updated data store:');
  console.log(dataStore.data.length + ' ' + dataStore.data[0]);
};

const handleSession = async msg => {
  if (userStore.userDetails.wsLoggedIn) {
    switch (msg.status) {
      case 'OK':
        // can't really happen unless we use the two-page login
        let token = msg.par;
        await localStorage.setItem('token', token);
        console.log(
          'websocket connection: got unexpected SESSION message: ' +
            msg.status +
            ', ' +
            msg.par
        );
        break;
      case 'FAIL':
        // user has logged out
        userStore.userDetails.wsLoggedIn = false;
        // TODO close the connection
        // TODO: present the login screen again
        break;
      default:
        console.log('Protocol bug, logged in, invalid status: ' + msg.status);
        break;
    }
  } else {
    //not logged in
    switch (msg.status) {
      case 'OK':
        // successful login to ws connection
        userStore.userDetails.wsLoggedIn = true;
        let token = msg.par;
        await localStorage.setItem('token', token);
        break;
      case 'FAIL':
        // login failed
        console.log('login to websocket connection failed: ' + msg.par);
        console.log(msg);
        // TODO: present the login screen again
        break;
      default:
        console.log(
          'Protocol bug, not logged in, invalid status: ' + msg.status
        );
        break;
    }
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

const loginToken = (socket, name, token) => {
  const message = {
    cmd: 'LOGIN_TOKEN',
    user: name,
    token: token,
  };
  sendRequest(socket, message);
};

const getAvailableCollections = socket => {
  const message = {
    cmd: 'GET_AV_COLL',
    id: msgIdCounter++,
  };
  sendRequest(socket, message);
};

const getCollection = (socket, name) => {
  const message = {
    cmd: 'GET_COLL',
    par: name,
    id: msgIdCounter++,
  };
  sendRequest(socket, message);
};

const getCollectionSize = (socket, name) => {
  const message = {
    cmd: 'GET_COLL_SIZE',
    par: name,
    id: msgIdCounter++,
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
    id: msgIdCounter++,
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
    id: msgIdCounter++,
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
  loginToken,
  getAvailableCollections,
  getCollection,
  getCollectionSize,
  getRecordsInRange,
  getRecordsInRangeSize,
  getLocalCollection,
  getLocalCollectionData,
};
