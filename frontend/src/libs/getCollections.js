import { userStore } from '@stores';
import { getAvailableCollections } from './wsutils';

// needs to observe appStore.loggedIn
let requestAvailableCollections = async () => {
  while (!userStore.userDetails.wsLoggedIn);
  getAvailableCollections(userStore.socket);
};

// needs to listen to dataStore.availableCollections
let fillCollectionsMenu = () => {
  // fill the pull down menu where the user selects the collection
};

export { requestAvailableCollections, fillCollectionsMenu };
