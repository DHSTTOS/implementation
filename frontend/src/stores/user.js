import { observable } from 'mobx';

class UserStore {
  /**
   * User details object
   */
  @observable
  userDetails = {
    userName: 'suitcase',
    authToken: '12345',
    wsLoggedIn: false,
  };

  /**
   * Websocket address of backend/data server.
   * Use the address of our droplet cloud server as default.
   */
  @observable
  wsEndpointURL = 'ws://159.89.213.72:8080/adininspector/adinhubsoc2';

  // do we need this to be observable though?
  // userDetails.wsLoggedIn should be enough to determine the state
  socket = null;
}

const userStore = new UserStore();

export default userStore;
