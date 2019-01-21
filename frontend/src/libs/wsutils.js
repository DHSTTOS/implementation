import appStore from "@stores/app";
import dataStore from "@stores/data";

const socket = new WebSocket("wss://echo.websocket.org/");

// as long as we keep these socket.something listener assignments within the same scope
// as the socket construction, we won't miss the 'open' event etc.
socket.onopen = _ => {
  // authenticate again when opening socket
  const tokenMsg = {
    username: appStore.username,
    token: appStore.authToken,
  };
  socket.send(JSON.stringify(tokenMsg));
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

socket.onmessage = e => {
  handleData(e.data);
};

export default { socket };
