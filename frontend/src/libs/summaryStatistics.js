/**
 * @typedef ConnectionNumberDatum
 * @type {Object}
 * @property {ID} _id
 * @property {Timestamp} date
 * @property {Connection[]} connections
 */

/**
 * @typedef Timestamp
 * @type {Object}
 * @property {string} $date
 */

/**
 * @typedef ID
 * @type {Object}
 * @property {string} $numberLong
 */

/**
 * @typedef Connection
 * @type {Object}
 * @property {string} Layer
 * @property {number} count
 */

/*
 * Find the max over all records and layers and return it.
 *
 * @param {Object} connectionNumberData
 *
 * @return {number}
 */
const findConnectionMax = connectionNumberData => {
  const maxPerRecord = connectionNumberData.map(record =>
    Math.max(...record.connections.map(l => l.count))
  );
  const maxConnections = Math.max(...maxPerRecord);
  return maxConnections;
};

export { findConnectionMax };
