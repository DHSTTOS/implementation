import React, { Component } from 'react';
import axios from 'axios';

import './App.css';
import './components/UserForm.css';

//https://api.github.com/users/fjajf  //whatever account the boys have
import UserForm from './components/UserForm';
import { MuiThemeProvider } from 'material-ui/styles';

class App extends Component {
  //state = {
  //repos: null
  ///}

  //   getUser = (e) => {
  //    // e.preventDefault(); //prevent the page from reloading
  //     const user = e.target.elements.username.value;
  //     axios.get(`https://api.github.com/users/${user}`) //strings used to include variable
  //     .then((result)=>{
  // console.log(result);
  //     })
  //   }

  render() {
    return (
      <MuiThemeProvider>
        <div className="App">
          <header className="App-header">
            <h1 className="App title">ADIN Inspect</h1>
          </header>
          <UserForm getUser={this.getUser} />
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
