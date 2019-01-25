import { DEFAULT_SOURCE_NAME, DEFAULT_GLOBAL_FILTERS } from "./consts";

import {
  socket,
  login_token,
  getAvailableCollections,
  getCollection,
  getCollectionSize,
  getRecordsInRange,
  getRecordsInRangeSize,
} from "./wsutils";

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
  // get all the names of groups of data by groupID
  const groups = new Set();
  rawData.forEach(e => groups.add(e[groupName]));
  const dataArr = [];
  groups.forEach(e => dataArr.push({ id: e, data: [] }));

  rawData.map(e => {
    dataArr
      .filter(o => o.id === e[groupName])
      .map(o => o.data.push({ x: e[x], y: e[y] }));
  });

  return dataArr;
};

export {
  DEFAULT_SOURCE_NAME,
  DEFAULT_GLOBAL_FILTERS,
  socket,
  login_token,
  getAvailableCollections,
  getCollection,
  getCollectionSize,
  getRecordsInRange,
  getRecordsInRangeSize,
  formatData,
};
