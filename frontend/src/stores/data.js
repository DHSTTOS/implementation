import { observable, action } from "mobx";
import { DEFAULT_SOURCE_NAME } from "@libs";

class DataStore {
  @observable
  available_collections = []; //exampleCollection

  // Raw network data
  @observable
  rawdata = [];

  // Array of notification/alarm data sets:
  @observable
  alarms = [
    {
      name: "",
      keys: [], // array of the JSON keys that this alarm type has
      data: [], // array of JSON strings representing the datapoints
    },
  ];
}

const dataStore = new DataStore();

export default dataStore;

export const exampleCollection = {
  name: "1_RAW",
  size: 1,
  isRealTimeData: false,
};
