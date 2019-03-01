import { userStore } from '@stores';
import { getCollectionGroups } from './wsutils';
import { autorun } from 'mobx';

let requestAvailableCollections = () => {
  autorun(() => {
    if (userStore.userDetails.wsLoggedIn) {
      getCollectionGroups(userStore.socket);
    }
  });
};

export { requestAvailableCollections };
