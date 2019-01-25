import { observable, action } from "mobx";
import { DEFAULT_SOURCE_NAME } from "@libs";

class AppStore {
  /**
   * This is supposed to be used for sizing the diagrams, because "responsive"
   * versions of nivo hogs resources...
   */
  @observable
  diagramDimension = {
    width: window.innerWidth * 0.85,
    height: window.innerHeight * 0.6,
  };

  @action
  updateDiagramDimension = () => {
    const maxWidth = window.innerWidth * 0.85;
    if (this.diagramConfigs.length > 1) {
      this.diagramDimension.width = maxWidth / 2;
    } else {
      this.diagramDimension.width = maxWidth;
    }
  };

  /**
   * This is the list containing the configs for each individual diagrams
   */
  @observable
  diagramConfigs = []; // format TBD

  @action
  addNewDiagram = diagramConfig => {
    this.diagramConfigs.push({
      diagramID: this.configModal.diagramID,
      ...diagramConfig,
    });
  };

  @action
  updateDiagram = diagramID => diagramConfig => {
    this.diagramConfigs = this.diagramConfigs.map(config =>
      config.diagramID === diagramID
        ? {
            diagramID: diagramID,
            ...diagramConfig,
          }
        : config
    );
  };

  @action
  closeDiagram = diagramID => {
    this.diagramConfigs = this.diagramConfigs.filter(
      config => config.diagramID !== diagramID
    );
  };

  /**
   * Modal UI state
   */
  @observable
  configModal = {
    isOpen: false,
    diagramID: -1,
  };

  @action
  openConfigModal = diagramID => {
    this.configModal = {
      isOpen: true,
      diagramID: diagramID,
    };
  };

  @action
  closeConfigModal = () => {
    this.configModal = {
      isOpen: false,
      diagramID: -1,
    };
  };

  /**
   * User details object
   */
  @observable
  userDetails = {
    userName: "",
    authToken: "",
    wsLoggedIn: false,
  };

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
    this.updateDiagramDimension();
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
  @action
  updateSingleFilters = diagramID => (category, name) => value => {
    // TODO: finish this logic
    this.globalFilters[category][name] = value;
  };
}

const appStore = new AppStore();

export default appStore;
