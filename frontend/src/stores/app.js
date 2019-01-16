import { observable, action } from "mobx";
import { DEFAULT_SOURCE_NAME } from "@libs";

class AppStore {
  /**
   * This is the list containing the configs for each individual diagrams
   */
  @observable
  diagramConfigs = []; // format TBD

  @observable
  diagramConfigModal = {
    isOpen: false,
    diagramID: -1,
  };

  @observable
  username = "";

  @observable
  sourceSelected = DEFAULT_SOURCE_NAME;

  @observable
  sourcesAvailable = [
    {
      name: DEFAULT_SOURCE_NAME,
      stream: {}, // format TBD
    },
  ];

  @observable
  globalFilters = {
    layers: {
      layer1: false,
      layer2: false,
      layer3: false,
      layer4: false,
      layer5: false,
      layer6: false,
      layer7: false,
    },
    protocols: {
      tcp: false,
      udp: false,
      // more protocols
    },
  };

  @action
  resetDiagramConfigs = () => {
    this.diagramConfigs = [];
  };

  @action
  resetGlobalFilters = () => ({
    layers: {
      layer1: false,
      layer2: false,
      layer3: false,
      layer4: false,
      layer5: false,
      layer6: false,
      layer7: false,
    },
    protocols: {
      tcp: false,
      udp: false,
      // more protocols
    },
  });

  @action
  updateGlobalFilters = (category, name) => value => {
    this.globalFilters[category][name] = value;
  };

  // more actions, everything
}

const appStore = new AppStore();

export default appStore;
