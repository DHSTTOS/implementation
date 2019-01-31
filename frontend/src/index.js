import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createConnection } from '@libs';

// Considering to use context instead of directly importing socket in the app...
const WSContext = React.createContext('ws');

// If there's a need to reassign a WebSocket to socket, please make this into an object
// or create a callback function to reassign the variable, of course, change const to `let`
const socket = createConnection();

const AppWithContext = () => (
  <WSContext.Provider value={socket}>
    <App />
  </WSContext.Provider>
);

ReactDOM.render(<AppWithContext />, document.getElementById('root'));
