import appStore from "@stores/app";
import dataStore from "@stores/data";

const socket = new WebSocket("wss://echo.websocket.org/");
let msgIdCounter = 0;

// as long as we keep these socket.something listener assignments within the same scope
// as the socket construction, we won't miss the 'open' event etc.

socket.login_token = (name, token) => {
  const tokenMsg = {
    cmd: "LOGIN_TOKEN",
    user: name,
    token: token,
    id: msgIdCounter++
  };
  socket.send(JSON.stringify(tokenMsg));
}

socket.onopen = _ => {
  // authenticate again when opening socket
  login_token(appStore.username, appStore.authToken);
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
  switch(appStore.wsLoggedIn) {
    case true:
      switch msg.status {
        case "OK":
	  // can't really happen
	  alert("websocket connection: got unexpected SESSION message: " + msg.status + ", " + msg.par);
	  break;
        case "FAIL":
          // user has logged out
	  appStore.wsLoggedIn = false;
	  // TODO close the connection
          // TODO: present the login screen again
	  break;
      }

    case false:
      //not logged in
      switch msg.status {
        case "OK":
          // successful login to ws connection
	  appStore.wsLoggedIn = true;
	  break;
        case "FAIL":
          // login failed
	  alert("login to websocket connection failed: " + msg.par);
          // TODO: present the login screen again
	  break;
      }
    break;
  }
}
      
socket.onmessage = message => {
  msg = JSON.parse(message);
  switch(msg.cmd) {
    case "SESSION":
      handleSession(msg);
      break;
    case "LIST_COL":
      dataStore.available_collections = msg.par;
      break;
    case "COLL_SIZE":
      break;
    case "DATA":
      handleData(msg.par);
      break;
    default :
      alert("illegal message from server: " + msg.cmd);
      break;
  }
};


socket.getAvailableCollections = _ => {
  const message = {
    cmd: "GET_AV_COLL",
    id: msgIdCounter++
  }
 socket.send(JSON.stringify(message));
}

socket.getCollection = name => {
  const message = {
    cmd: "GET_COLL",
    par: name,
    id: msgIdCounter++
  }
 socket.send(JSON.stringify(message));
}

socket.getCollectionSize = name => {
  const message = {
    cmd: "GET_COLL_SIZE",
    par: name,
    id: msgIdCounter++
  }
 socket.send(JSON.stringify(message));
}

socket.getRecordsInRange = (name, key, startValue, endValue) => {
  const message = {
    cmd: "GET_RECORDS_RANGE",
    par: name,
    key: key,
    start: startValue,
    end: endValue,
    id: msgIdCounter++
  }
 socket.send(JSON.stringify(message));
}

socket.getRecordsInRangeSize = (name, key, startValue, endValue) => {
  const message = {
    cmd: "GET_RECORDS_RANGE_SIZE",
    par: name,
    key: key,
    start: startValue,
    end: endValue,
    id: msgIdCounter++
  }
 socket.send(JSON.stringify(message));
}

export default { socket };
