/**
 * @typedef DataPoint
 * @type {Object}
 * @property {string} L2Protocol
 * @property {string} SourceMACAddress
 * @property {string} L4Protocol
 * @property {string} SourceIPAddress
 * @property {string} PacketSummary
 * @property {number} PacketID
 * @property {string} DestinationIPAddress
 * @property {TimestampObject} Timestamp
 * @property {string} DestinationPort
 * @property {string} SourcePort
 * @property {string} L3Protocol
 * @property {string} DestinationMACAddress
 */

/**
 * @typedef TimestampObject
 * @type {Object}
 * @property {number} $date
 */

/**
 * @param {DataPoint[]} data
 * @returns {DataPoint[]}
 */
const removeL2 = data => {
  return data.filter(x => x["L2Protocol"].length === 0);
};

/**
 * @param {DataPoint[]} data
 * @returns {DataPoint[]}
 */
const removeL3 = data => {
  return data.filter(x => x["L3Protocol"].length === 0);
};

/**
 * @param {DataPoint[]} data
 * @returns {DataPoint[]}
 */
const removeL4 = data => {
  return data.filter(x => x["L4Protocol"].length === 0);
};

/**
 * @param {DataPoint[]} data
 * @returns {DataPoint[]}
 */
const removeEther = data => {
  return data.filter(x => x["L2Protocol"] !== "Ether");
};

/**
 * @param {DataPoint[]} data
 * @returns {DataPoint[]}
 */
const removeProfinet = data => {
  return data.filter(x => x["L2Protocol"] !== "Profinet");
};

/**
 * @param {DataPoint[]} data
 * @returns {DataPoint[]}
 */
const removeUDP = data => {
  return data.filter(x => x["L4Protocol"] !== "UDP");
};

export default {
  removeL2,
  removeL3,
  removeL4,
  removeEther,
  removeProfinet,
  removeUDP,
};
