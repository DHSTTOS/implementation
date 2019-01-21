import { observable, action } from "mobx";
import { DEFAULT_SOURCE_NAME } from "@libs";

class DataStore {
  @observable
  available_collections = [];

  @observable
  data = [];
}

const dataStore = new DataStore();

export default dataStore;
