import { DEFAULT_SOURCE_NAME } from "./consts";

import {
  socket,
  login_token,
  getAvailableCollections,
  getCollection,
  getCollectionSize,
  getRecordsInRange,
  getRecordsInRangeSize,
} from "./wsutils";

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
};

export {
  DEFAULT_SOURCE_NAME,
  socket,
  login_token,
  getAvailableCollections,
  getCollection,
  getCollectionSize,
  getRecordsInRange,
  getRecordsInRangeSize,
  formatData,
};
