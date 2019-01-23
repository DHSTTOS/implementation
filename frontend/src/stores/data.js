import { observable, action } from "mobx";
import { DEFAULT_SOURCE_NAME } from "@libs";

class DataStore {
  @observable
  available_collections = []; //exampleCollection

  @observable
  data = [];
}

const dataStore = new DataStore();

export default dataStore;

export const exampleCollection = {
  name: "1_RAW",
  size: 1,
  isRealTimeData: false,
};
