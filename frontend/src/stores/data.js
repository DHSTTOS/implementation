import { observable, action } from "mobx";
import { DEFAULT_SOURCE_NAME } from "@libs";

class DataStore {
  @observable
  data = [];
}

const dataStore = new DataStore();

export default dataStore;
