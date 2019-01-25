import { appStore, dataStore } from "@stores";

const socket = new WebSocket("wss://echo.websocket.org/");
let msgIdCounter = 0;

// as long as we keep these socket.something listener assignments within the same scope
// as the socket construction, we won't miss the 'open' event etc.

const login_token = (name, token) => {
  const tokenMsg = {
    cmd: "LOGIN_TOKEN",
    user: name,
    token: token,
    id: msgIdCounter++,
  };
  socket.send(JSON.stringify(tokenMsg));
};

socket.onopen = _ => {
  // authenticate again when opening socket
  login_token(appStore.userDetails.userName, appStore.userDetails.authToken);
};

socket.onerror = err => {
  console.log("WebSocket Error: ", err);
};

socket.onclose = _ => {
  console.log("WebSocket connection closed.");
};

// Handle data below
const handleData = data => {
  console.log("Received message");
  console.log(data);

  dataStore.data = data;
  console.log("Updated data store");
  console.log(dataStore.data);
};

const handleSession = msg => {
  if (appStore.userDetails.wsLoggedIn) {
    switch (msg.status) {
      case "OK":
        // can't really happen
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
    }
  } else {
    //not logged in
    switch (msg.status) {
      case "OK":
        // successful login to ws connection
        appStore.userDetails.wsLoggedIn = true;
        break;
      case "FAIL":
        // login failed
        console.log("login to websocket connection failed: " + msg.par);
        // TODO: present the login screen again
        break;
    }
  }
};

socket.onmessage = message => {
  const msg = JSON.parse(message);
  switch (msg.cmd) {
    case "SESSION":
      handleSession(msg);
      break;
    case "LIST_COL":
      // msg.par will be array
      dataStore.available_collections = msg.par;
      break;
    case "COLL_SIZE":
      break;
    case "DATA":
      handleData(msg.par);
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
  socket.send(JSON.stringify(message));
};

const getCollection = name => {
  const message = {
    cmd: "GET_COLL",
    par: name,
    id: msgIdCounter++,
  };
  socket.send(JSON.stringify(message));
};

const getCollectionSize = name => {
  const message = {
    cmd: "GET_COLL_SIZE",
    par: name,
    id: msgIdCounter++,
  };
  socket.send(JSON.stringify(message));
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
  socket.send(JSON.stringify(message));
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
  socket.send(JSON.stringify(message));
};

export default {
  socket,
  login_token,
  getAvailableCollections,
  getCollection,
  getCollectionSize,
  getRecordsInRange,
  getRecordsInRangeSize,
};
