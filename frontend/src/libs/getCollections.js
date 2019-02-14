
// needs to observe appStore.loggedIn
let requestAvailabeCollections = () => {
  if (appsStore.loggedIn) {
    wsutils.getAvailableCollections(); // the server's response will be written to dataStore.availableCollections
  }
}

// needs to listen to dataStore.availableCollections
let fillCollectionsMenu = () => {
  // fill the pull down menu where the user selects the collection
}