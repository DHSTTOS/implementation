import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { socket } from '@libs';

// Considering to use context instead of directly importing socket in the app...
const WSContext = React.createContext('ws');

const AppWithContext = () => (
  <WSContext.Provider value={socket}>
    <App />
  </WSContext.Provider>
);

ReactDOM.render(<AppWithContext />, document.getElementById('root'));
