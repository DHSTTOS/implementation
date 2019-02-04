import {
  DEFAULT_SOURCE_NAME,
  DEFAULT_GLOBAL_FILTERS,
  SCATTER_PLOT,
  LINE_CHART,
  NIVO_COLOR_SCHEMES,
} from './consts';

import {
  createConnection,
  login,
  auth,
  logout,
  getAvailableCollections,
  getCollection,
  getCollectionSize,
  getRecordsInRange,
  getRecordsInRangeSize,
  getLocalCollection,
  getLocalCollectionData,
} from './wsutils';

import {
  removeL2,
  removeL3,
  removeL4,
  removeEther,
  removeProfinet,
  removeUDP,
} from './dataFilters';

/**
 * Formats raw data to nivo's format.
 *
 * @param {Object} p
 * @param {string} p.groupName
 * @param {string} p.x
 * @param {string} p.y
 * @param {Object[]} p.rawData
 *
 * @return {Object[]}
 */
const formatData = ({ groupName, x, y, rawData = [] }) => {
  // normalize the timestamp

  const normalizedRawData = rawData.map(x => ({
    ...x,
    //Timestamp: x['Timestamp']['$date'],
  }));

  rawData.map(console.log);

  // get all the names of groups of data by groupID
  const groups = new Set();
  normalizedRawData.forEach(e => groups.add(e[groupName]));
  const dataArr = [];
  groups.forEach(e => dataArr.push({ id: e, data: [] }));

  normalizedRawData.map(e => {
    dataArr
      .filter(o => o.id === e[groupName])
      .map(o => o.data.push({ x: e[x], y: e[y] }));
  });

  return dataArr;
};

export {
  DEFAULT_SOURCE_NAME,
  DEFAULT_GLOBAL_FILTERS,
  SCATTER_PLOT,
  LINE_CHART,
  NIVO_COLOR_SCHEMES,
  createConnection,
  login,
  auth,
  logout,
  getAvailableCollections,
  getCollection,
  getCollectionSize,
  getRecordsInRange,
  getRecordsInRangeSize,
  getLocalCollection,
  getLocalCollectionData,
  formatData,
  removeL2,
  removeL3,
  removeL4,
  removeEther,
  removeProfinet,
  removeUDP,
};
