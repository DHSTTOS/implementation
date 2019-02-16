import { userStore } from '@stores';
import { getAvailableCollections } from './wsutils';
import { autorun } from 'mobx';

let requestAvailableCollections = () => {
  autorun(() => {
    if (userStore.userDetails.wsLoggedIn)
      getAvailableCollections(userStore.socket);
  });
};

export { requestAvailableCollections };
