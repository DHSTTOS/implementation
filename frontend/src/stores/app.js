import { observable, action, computed } from 'mobx';
import {
  DEFAULT_GLOBAL_FILTERS,
  SCATTER_PLOT,
  LINE_CHART,
  LINE_CHART_LAYER,
  NIVO_COLOR_SCHEMES,
  DEFAULT_BRUSH_CONFIG,
} from '@libs';
import { dataStore } from '.';

// JS Doc type defs
/**
 * @typedef DiagramConfig
 * @type {Object}
 * @property {string} diagramID
 * @property {string} plotType
 * @property {string} x
 * @property {string} y
 * @property {(LinePlotConfig | ScatterPlotConfig | NetworkPlotConfig)} specConfig
 */

/**
 * @typedef ScatterPlotConfig
 * @type {Object}
 * @property {string} colors
 * @property {number} symbolSize
 */

/**
 * @typedef LinePlotConfig
 * @type {Object}
 * @property {string} colors
 * @property {number} lineWidth
 * @property {boolean} enableArea
 * @property {number} areaOpacity
 * @property {boolean} enableDynamicScaling
 */

/**
 * @typedef NetworkPlotConfig
 * @type {Object}
 * @property {number} lineWidth
 * @property {number} lineOpacity
 * @property {number} symbolSize
 */

class AppStore {
  /**
   * This is supposed to be used for sizing the diagrams, because "responsive"
   * versions of nivo hogs resources...
   */
  @observable
  diagramDimension = {
    width: window.innerWidth * 0.85,
    height: window.innerHeight * 0.55,
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
    console.log('Diagram ID #' + diagramID + ' is removed.');
  };

  /**
   * Modal UI state
   *
   * @type {object}
   * @property {boolean} isOpen
   * @property {DiagramConfig} diagramConfig
   */
  @observable
  configModal = {
    isOpen: false,
    diagramConfig: {},
  };

  /**
   * ID of the currently full screen diagram. Empty means none.
   *
   * @type {string}
   */
  @observable
  fullscreenDiagram = '';

  @action
  resetFullscreenDiagram = () => {
    this.fullscreenDiagram = '';
  };

  @computed
  get canSaveConfig() {
    if (!dataStore.currentlySelectedSource) return false;

    const config = this.configModal.diagramConfig;
    if (config.plotType === SCATTER_PLOT)
      return !!(config.plotType && config.x && config.y);

    return !!config.plotType;
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
        'Diagram ID #' + existingCurrentConfig.diagramID + ' is updated.'
      );
    } else {
      // init default values for config modal if the diagramID passed in doesn't exist
      this.configModal = {
        isOpen: true,
        diagramConfig: {
          diagramID,
          plotType: '',
          x: '',
          y: '',
          specConfig: null,
        },
      };
      console.log('Diagram ID #' + diagramID + ' is created.');
    }
  };

  @action
  closeConfigModal = () => {
    this.configModal = {
      isOpen: false,
      diagramConfig: {},
    };
  };

  @action
  setPlotType = plotType => {
    this.configModal.diagramConfig.plotType = plotType;
    let specConfig;
    switch (plotType) {
      case SCATTER_PLOT:
        specConfig = {
          colors: NIVO_COLOR_SCHEMES[0],
          symbolSize: 6,
          enableDynamicScaling: true,
        };
        break;
      case LINE_CHART:
        specConfig = {
          colors: NIVO_COLOR_SCHEMES[0],
          lineWidth: 2,
          enableArea: false,
          areaOpacity: 0.2,
          enableDynamicScaling: true,
        };
        break;
      case LINE_CHART_LAYER:
        specConfig = {
          colors: NIVO_COLOR_SCHEMES[0],
          lineWidth: 2,
          enableArea: false,
          areaOpacity: 0.2,
          enableDynamicScaling: true,
        };
        break;
    }
    this.configModal.diagramConfig.specConfig = specConfig;
  };
  @action
  setXAxis = x => {
    this.configModal.diagramConfig.x = x;
  };
  @action
  setYAxis = y => {
    this.configModal.diagramConfig.y = y;
  };

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
  updateGlobalFilters = name => value => {
    this.globalFilters[name] = value;
  };

  @action
  updateSingleFilters = diagramID => (category, name) => value => {
    // TODO: finish this logic
    this.globalFilters[name] = value;
  };

  @observable
  brushConfig = DEFAULT_BRUSH_CONFIG;

  @action
  updateBrushConfig = name => value => {
    this.brushConfig[name] = value;
  };
}

const appStore = new AppStore();

export default appStore;
