import React from 'react';
import TextField from '@material-ui/core/TextField';
// import Button from "@material-ui/core/Button";
import styled from '@emotion/styled';

import './UserForm.css';
import { RaisedButton } from 'material-ui';
// import { browserHistory } from 'react-router';
// import { ContentSave } from 'material-ui/svg-icons';

// function save() {
//   var fieldValue = document.getElementById('endpoint').value;
//   localStorage.setItem('text', fieldValue);
// }

var tag = document.getElementById('Button');
//document.getElementById("myButton");

function mouseOver() {
  tag.style.background = 'yellow';
}
function mouseOut() {
  tag.style.background = 'white';
}

const MyButton = styled(RaisedButton)`
  background-color: transparent;
  border: none;
  color: transparent;
  text-align: center;
  text-decoration: none;
  font-size: 16px;

  cursor: pointer;
`;

class UserForm extends React.Component {
  handleClick = () => {
    window.location.href = 'https://www.google.de/';
  };

  state = {
    username: '',
    password: '',
    endpoint: '',
  };

  change = e => {
    this.setState({
      [e.target.name]: e.target.value,
    });
    console.log('change2: ' + e + ' ' + e.target + ' ' + e.target.name);
  };

  onSubmit = e => {
    e.preventDefault();
    console.log(this.state);
  };

  login2 = async _ => {
    var fieldValue = document.getElementById('endpoint').value;
    await localStorage.setItem('text', fieldValue);
    // ws.login(username, password); // Bypass auth for now
    window.location.href = 'main';
  };

  render() {
    return (
      <form>
        <TextField
          name="username"
          hintText="UserId"
          floatingLabelText="UserId"
          placeholder="User Name"
          value={this.state.username}
          onChange={e => this.change(e)}
          margin="normal"
          text-align-center
        />
        <br />
        <TextField
          name="password"
          hintText="Password"
          floatingLabelText="Password"
          type="password"
          placeholder="Password"
          value={this.state.password}
          onChange={e => this.change(e)}
          margin="normal"
        />
        <br />
        <TextField
          id="endpoint"
          name="endpoint"
          floatingLabelText="Endpoint"
          hintText="Endpoint"
          placeholder="wss://adininspector.currno.de/adininspector/adinhubsoc2"
          value={this.state.endpoint}
          onChange={e => this.change(e)}
          floatingLabelFixed={true}
          margin="normal"
        />
        <br />
        <br />
        <MyButton
          label="Login"
          //onClick={this.handleClick}
          //onClick = {save}
          onClick={this.login2}
          id="Button"
          onmouseover={mouseOver}
          onmouseout={mouseOut}
        />
      </form>
    );
  }
}

export default UserForm; //bcs we need to import it on the js file
