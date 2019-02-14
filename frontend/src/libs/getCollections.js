import { appStore } from '@stores';

// needs to observe appStore.loggedIn
let requestAvailableCollections = () => {
  if (appStore.loggedIn) {
    wsutils.getAvailableCollections(); // the server's response will be written to dataStore.availableCollections
  }
};

// needs to listen to dataStore.availableCollections
let fillCollectionsMenu = () => {
  // fill the pull down menu where the user selects the collection
};

export { requestAvailableCollections, fillCollectionsMenu };
