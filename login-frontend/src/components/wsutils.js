//import { appStore, dataStore } from "@stores";
//import * as appStore from "./stores/app.js";
import appStore from "./stores/app.js";
//import * as dataStore from "./stores/data.js";
import dataStore from "./stores/data.js";

const socket = new WebSocket("ws://localhost:8080/adininspector/adinhubsoc2");
let msgIdCounter = 0;
let msgRegister = [];

// as long as we keep these socket.something listener assignments within the same scope
// as the socket construction, we won't miss the 'open' event etc.


// Takes a message object, adds id, registers it, and sends it.
const sendRequest = msg => {
  msg.id = msgIdCounter++;
  msgRegister[msg.id] = msg;
  socket.send(JSON.stringify(msg));
};


export const login = (name, password) => {
  const message = {
    cmd: "LOGIN",
    user: name,
    pwd: password,
  };
  sendRequest(message);
};

const loginToken = (name, token) => {
  const message = {
    cmd: "LOGIN_TOKEN",
    user: name,
    token: token,
  };
  sendRequest(message);
};

socket.onopen = _ => {
  // authenticate again when opening socket
  loginToken(appStore.userDetails.userName, appStore.userDetails.authToken);
};

socket.onerror = err => {
  console.log("WebSocket Error: ", err);
};

socket.onclose = _ => {
  console.log("WebSocket connection closed.");
};

// Handle data below
const handleData = msg => {
  console.log("Received data message: " + msg.data.length + " " + msg.data[0]);
  if (!msgRegister[msg.id]) {
    console.log("Protocol: bug: received unrequested message, dropping it: " + msg);
    return;
  }
  let context = msgRegister[msg.id];  // the request that triggered this msg
  let collName = context.par;
  if (collName.indexOf('_') > -1) {
    dataStore.alarms[collName].data = {
      name: collName,
      keys: Object.keys(msg.data[0]),	// XXX: if data empty and this existed already, should we copy the old keys instead of overwriting with []?
      data: msg.data
    };
  } else {
    dataStore.rawdata = msg.data;
    dataStore.availableKeys = Object.keys(msg.data[0]);
  }
  // TODO: remove msgRegister[msg.id]

  console.log("Updated data store:");
  console.log(dataStore.data.length + " " + dataStore.data[0]);
};

const handleSession = async msg => {
  console.log("handleSession");
  if (appStore.userDetails.wsLoggedIn) {
    switch (msg.status) {
      case "OK":
        // can't really happen unless we use the two-page login
	let token = msg.par;
        await localStorage.setItem('token', token);
        console.log(
          "websocket connection: got unexpected SESSION message: " +
            msg.status +
            ", " +
            msg.par
        );
        break;
      case "FAIL":
        // user has logged out
        appStore.userDetails.wsLoggedIn = false;
        // TODO close the connection
        // TODO: present the login screen again
        break;
      default:
        console.log("Protocol bug, logged in, invalid status: " + msg.status);
        break;
    }
  } else {
    //not logged in
    console.log("not logged in, msg.status: " + msg.status);
    switch (msg.status) {
      case "OK":
        // successful login to ws connection
        appStore.userDetails.wsLoggedIn = true;
	let token = msg.par;
	console.log("not logged in, OK: " + token);
	if (token)
          await localStorage.setItem('token', token);
        break;
      case "FAIL":
        // login failed
        console.log("login to websocket connection failed: " + msg.par);
        // TODO: present the login screen again
        break;
      default:
        console.log("Protocol bug, not logged in, invalid status: " + msg.status);
        break;
    }
  }
};

socket.onmessage = message => {
  console.log("onmessage: " + message.data);
  const msg = JSON.parse(message.data);
  switch (msg.cmd) {
    case "SESSION":
      handleSession(msg);
      break;
    case "LIST_COL":
      // msg.par will be array
      dataStore.availableCollections = msg.par;
      break;
    case "COLL_SIZE":
      break;
    case "DATA":
      handleData(msg);
      break;
    default:
      console.log("illegal message from server: " + msg.cmd);
      break;
  }
};

const getAvailableCollections = _ => {
  const message = {
    cmd: "GET_AV_COLL",
    id: msgIdCounter++,
  };
  sendRequest(message);
};

const getCollection = name => {
  const message = {
    cmd: "GET_COLL",
    par: name,
    id: msgIdCounter++,
  };
  sendRequest(message);
};

const getCollectionSize = name => {
  const message = {
    cmd: "GET_COLL_SIZE",
    par: name,
    id: msgIdCounter++,
  };
  sendRequest(message);
};

const getRecordsInRange = (name, key, startValue, endValue) => {
  const message = {
    cmd: "GET_RECORDS_RANGE",
    par: name,
    key: key,
    start: startValue,
    end: endValue,
    id: msgIdCounter++,
  };
  sendRequest(message);
};

const getRecordsInRangeSize = (name, key, startValue, endValue) => {
  const message = {
    cmd: "GET_RECORDS_RANGE_SIZE",
    par: name,
    key: key,
    start: startValue,
    end: endValue,
    id: msgIdCounter++,
  };
  sendRequest(message);
};


// Get a collection from local storage. If no name given, return the raw data as a pseudo collection.
const getLocalCollection = (collName) => {
  if (collName === "") {
    return {
      name: "",
      keys: ["L2Protocol", "SourceMACAddress", "L4Protocol", "SourceIPAddress", "PacketSummary", "PacketID", "DestinationIPAddress", "Timestamp", "DestinationPort", "SourcePort", "L3Protocol", "DestinationMACAddress"],
      data: dataStore.rawdata
    };
  } else {
    return dataStore.alarms[collName];
  }
}


// Get the data of the specified collection from local storage. Returns an array of JSON strings representing the datapoints.
const getLocalCollectionData = (collName) => {
  if (collName === "") {
    return dataStore.rawdata;
  } else {
    return dataStore.alarms[collName].data;
  }
}


export default {
  socket,
  login,
  loginToken,
  getAvailableCollections,
  getCollection,
  getCollectionSize,
  getRecordsInRange,
  getRecordsInRangeSize,
  getLocalCollection,
  getLocalCollectionData
};
