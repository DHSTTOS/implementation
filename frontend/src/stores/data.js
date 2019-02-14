import { observable, action } from 'mobx';
import {
  lmf,
  lmf_FlowRatePerSecond,
  lmf_NumberOfConnectionsPerNode,
  nodeLinkSample,
} from '../../mockdata';
import appStore from './app';

class DataStore {
  // TODO: when ws binding is done, we'll make this flexible
  // TODO: we need to create separate vars for all plot types, since they are gonna use different data sources
  @observable
  availableKeys = Object.keys(lmf[0]);

  @observable
  sourceOptions = [];
  @observable
  currentlySelectedSource = '';
  @action
  selectSource = source => {
    if (this.currentlySelectedSource === source) return;

    appStore.resetDiagramConfigs();
    this.resetData();
    this.currentlySelectedSource = source;
    //TODO: populate different data vars down below
  };

  @observable.shallow
  rawData = [];
  @observable.shallow
  flowrateData = [];
  @observable.shallow
  connectionNumberData = [];
  @observable.shallow
  addressAndLinksData = [];

  // The slice of data that is currently selected by the slider
  @observable.shallow
  currentlySelectedRawData = [];
  @observable.shallow
  currentlySelectedFlowrateData = [];
  @observable.shallow
  currentlySelectedConnectionNumberData = [];
  @observable.shallow
  currentlySelectedAddressAndLinksData = [];

  @observable
  endpoints = []; // The start and end indices for the x-axis

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
