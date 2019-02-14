import { userStore } from '@stores';
import { getAvailableCollections } from './wsutils';
import { autorun } from 'mobx';

let requestAvailableCollections = () => {
  autorun(() => {
    if (userStore.userDetails.wsLoggedIn)
      getAvailableCollections(userStore.socket);
  });
};

// needs to listen to dataStore.availableCollections
let fillCollectionsMenu = () => {
  // fill the pull down menu where the user selects the collection
};

export { requestAvailableCollections, fillCollectionsMenu };
