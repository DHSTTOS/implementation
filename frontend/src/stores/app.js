import { observable, action, computed } from "mobx";
import { DEFAULT_SOURCE_NAME, DEFAULT_GLOBAL_FILTERS } from "@libs";

// JS Doc type defs
/**
 * @typedef DiagramConfig
 * @type {Object}
 * @property {string} diagramID
 * @property {string} plotType
 * @property {string} groupName
 * @property {string} x
 * @property {string} y
 * @property {(LinePlotConfig | ScatterPlotConfig | NetworkPlotConfig)} specConfig
 */

/**
 * @typedef LinePlotConfig
 * @type {Object}
 * @property {boolean} useColor
 * @property {boolean} enableLegends
 * @property {boolean} enableTooltip
 * @property {number} lineWidth
 * @property {number} lineOpacity
 * @property {number} pointSize
 * @property {number} pointOpacity
 * @property {boolean} enableArea
 * @property {number} areaOpacity
 */

/**
 * @typedef ScatterPlotConfig
 * @type {Object}
 * @property {boolean} useColor
 * @property {boolean} enableLegends
 * @property {boolean} enableTooltip
 * @property {number} pointSize
 * @property {number} pointOpacity
 */

/**
 * @typedef NetworkPlotConfig
 * @type {Object}
 * @property {boolean} useColor
 * @property {boolean} enableLegends
 * @property {boolean} enableTooltip
 * @property {number} lineWidth
 * @property {number} lineOpacity
 * @property {number} pointSize
 * @property {number} pointOpacity
 */

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
   *
   * @type {DiagramConfig[]}
   */
  @observable
  diagramConfigs = [];

  @action
  updateDiagram = () => {
    const existingCurrentConfig = this.diagramConfigs.find(
      x => x.diagramID === this.configModal.diagramConfig.diagramID
    );

    // if exists, pull updated config from configModal
    // if doesn't exist, add config from configModal to diagramConfigs
    if (existingCurrentConfig) {
      this.diagramConfigs = this.diagramConfigs.map(x =>
        x.diagramID === existingCurrentConfig.diagramID
          ? this.configModal.diagramConfig
          : x
      );
    } else {
      this.diagramConfigs.push(this.configModal.diagramConfig);
    }
  };

  @action
  closeDiagram = diagramID => {
    this.diagramConfigs = this.diagramConfigs.filter(
      config => config.diagramID !== diagramID
    );
    console.log("Diagram ID #" + diagramID + " is removed.");
  };

  /**
   * Modal UI state
   */
  @observable
  configModal = {
    isOpen: false,
    diagramConfig: {},
  };

  @computed
  get canSaveConfig() {
    const config = this.configModal.diagramConfig;
    return !!(config.plotType && config.x && config.y && config.groupName);
  }

  @action
  openConfigModal = diagramID => {
    const existingCurrentConfig = this.diagramConfigs.find(
      x => x.diagramID === diagramID
    );

    if (existingCurrentConfig) {
      this.configModal = {
        isOpen: true,
        diagramConfig: { ...existingCurrentConfig },
      };
      console.log(
        "Diagram ID #" + existingCurrentConfig.diagramID + " is updated."
      );
    } else {
      // init default values for config modal if the diagramID passed in doesn't exist
      this.configModal = {
        isOpen: true,
        diagramConfig: {
          diagramID,
          plotType: "",
          groupName: "",
          x: "",
          y: "",
          useColor: false,
          enableLegends: false,
          enableTooltip: false,
          specConfig: null,
        },
      };
      console.log("Diagram ID #" + diagramID + " is created.");
    }
  };

  @action
  closeConfigModal = () => {
    this.configModal = {
      isOpen: false,
      diagramConfig: {},
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

  /**
   * Data source
   */
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
  globalFilters = DEFAULT_GLOBAL_FILTERS;

  @action
  resetDiagramConfigs = () => {
    this.diagramConfigs = [];
    this.updateDiagramDimension();
  };

  @action
  resetGlobalFilters = () => (this.globalFilters = DEFAULT_GLOBAL_FILTERS);
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
