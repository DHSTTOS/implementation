import {
  DEFAULT_SOURCE_NAME,
  DEFAULT_GLOBAL_FILTERS,
  SCATTER_PLOT,
  LINE_CHART,
  NODE_LINK,
  NIVO_COLOR_SCHEMES,
  DEFAULT_BRUSH_CONFIG,
} from './consts';

import {
  createConnection,
  login,
  auth,
  logout,
  getAvailableCollections,
  getCollectionGroups,
  getCollectionGroupData,
  getCollectionGroupEndpoints,
  getCollection,
  getCollectionSize,
  getEndpoints,
  getRecord,
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

import { requestAvailableCollections } from './getCollections';
import { dataStore } from '@stores';

/**
 * Formats raw data to nivo's format.
 *
 * @param {Object} p
 * @param {string} p.groupName
 * @param {string} p.x
 * @param {string} p.y
 * @param {Object[]} p.unformattedData
 *
 * @return {Object[]}
 */
const formatData = ({ groupName, x, y, unformattedData: rawData = [] }) => {
  // normalize the timestamp
  const normalizedRawData = rawData.map(x => ({
    ...x,
    Timestamp: x['Timestamp']['$date'],
    id: Number(x['_id']['$numberLong']),
  }));

  // get all the names of groups of data by groupID
  const groups = new Set();
  normalizedRawData.forEach(e => groups.add(e[groupName]));
  const dataArr = [];
  groups.forEach(e => dataArr.push({ id: e, data: [] }));

  normalizedRawData.map(e => {
    dataArr
      .filter(o => o.id === e[groupName])
      .map(o => o.data.push({ x: e[x], y: e[y], id: e['id'] }));
  });

  return dataArr;
};

/**
 * @param {number} id
 *
 * @return {Object[]}
 */
const selectOriginalRawDatum = id => {
  return dataStore.rawData.filter(x => x['_id']['$numberLong'] == id)[0];
};

export {
  DEFAULT_SOURCE_NAME,
  DEFAULT_GLOBAL_FILTERS,
  SCATTER_PLOT,
  LINE_CHART,
  NODE_LINK,
  NIVO_COLOR_SCHEMES,
  DEFAULT_BRUSH_CONFIG,
  createConnection,
  login,
  auth,
  logout,
  getAvailableCollections,
  getCollectionGroups,
  getCollectionGroupData,
  getCollectionGroupEndpoints,
  getCollection,
  getCollectionSize,
  getEndpoints,
  getRecord,
  getRecordsInRange,
  getRecordsInRangeSize,
  getLocalCollection,
  getLocalCollectionData,
  removeL2,
  removeL3,
  removeL4,
  removeEther,
  removeProfinet,
  removeUDP,
  requestAvailableCollections,
  formatData,
  selectOriginalRawDatum,
};
