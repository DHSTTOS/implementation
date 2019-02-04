import { observable, action } from 'mobx';
import { DEFAULT_SOURCE_NAME } from '@libs';
import { jsonstreams } from '../../mockdata';

class DataStore {
  @observable
  // TODO: when ws binding is done, we'll make this flexible
  availableKeys = Object.keys(jsonstreams[0]);

  @observable
  availableCollections = []; //exampleCollection

  // Raw network data
  @observable
  rawData = [];

  @observable
  endpoints = []; // The start and end indices for the x-axis

  // The slice of raw data that is currently selected by the slider:
  currentlySelectedData = [];

  @observable
  sourceOptions = ['Source 1', 'Live'];
  @observable
  currentlySelectedSource = '';
  @action
  selectSource = source => {
    this.currentlySelectedSource = source;
  };

  // Array of notification/alarm data sets:
  @observable
  alarms = [
    {
      name: '',
      keys: [], // array of the JSON keys that this alarm type has
      data: [], // array of JSON strings representing the datapoints
      endpoints: [],
    },
  ];
}

const dataStore = new DataStore();

export default dataStore;

export const exampleCollection = {
  name: '1_RAW',
  size: 1,
  isRealTimeData: false,
};
