import { userStore } from '@stores';
import { getAvailableCollections, getCollectionGroups } from './wsutils';
import { autorun } from 'mobx';

let requestAvailableCollections = () => {
  autorun(() => {
    if (userStore.userDetails.wsLoggedIn) {
      getCollectionGroups(userStore.socket);
    }
  });
};

export { requestAvailableCollections };
