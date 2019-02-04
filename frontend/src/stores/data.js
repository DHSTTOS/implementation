import { observable, action } from 'mobx';
import { DEFAULT_SOURCE_NAME } from '@libs';
import { jsonstreams } from '../../mockdata';
import appStore from './app';

class DataStore {
  // TODO: when ws binding is done, we'll make this flexible
  availableKeys = Object.keys(jsonstreams[0]);

  @observable
  availableCollections = []; //exampleCollection

  // Raw network data
  @observable.shallow
  rawData = jsonstreams;

  @observable
  endpoints = []; // The start and end indices for the x-axis

  // The slice of raw data that is currently selected by the slider:
  @observable.shallow
  currentlySelectedData = jsonstreams;

  @observable
  sourceOptions = ['Source 1', 'Live'];
  @observable
  currentlySelectedSource = '';
  @action
  selectSource = source => {
    if (this.currentlySelectedSource === source) return;

    appStore.resetDiagramConfigs();
    this.resetData();
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

  @action
  resetData = () => {
    this.availableCollections = [];
    this.rawData = [];
    this.endpoints = [];
    this.currentlySelectedData = [];
    this.alarms = [];
  };
}

const dataStore = new DataStore();

export default dataStore;

export const exampleCollection = {
  name: '1_RAW',
  size: 1,
  isRealTimeData: false,
};
