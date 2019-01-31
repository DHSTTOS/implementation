import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { createConnection } from '@libs';
import { userStore } from '@stores';

// Now the socket field is accessible throughout the known universe and until the end of time
userStore.socket = createConnection();

ReactDOM.render(<App />, document.getElementById('root'));
