import { appStore } from "@stores";

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
 * @param {DataPoint} packet
 * @returns {Boolean}
 */
const passEther = packet => {
  return packet["L2Protocol"] == "Ether";
};

/**
 * @param {DataPoint} packet
 * @returns {Boolean}
 */
const passProfinet = packet => {
  return packet["L2Protocol"] == "Profinet";
};

/**
 * @param {DataPoint} packet
 * @returns {Boolean}
 */
const passL2Other = packet => {
  return (
    packet["L2Protocol"] !== "Ether" && packet["L2Protocol"] !== "Profinet"
  );
};

/**
 * @param {DataPoint} packet
 * @returns {Boolean}
 */
const passUDP = packet => {
  return packet["L4Protocol"] == "UDP";
};

/**
 * @param {DataPoint} packet
 * @returns {Boolean}
 */
const passTCP = packet => {
  return packet["L4Protocol"] == "TCP";
};

/**
 * @param {DataPoint} packet
 * @returns {Boolean}
 */
const passL4Other = packet => {
  return packet["L4Protocol"] !== "UDP" && packet["L4Protocol"] !== "TCP";
};

/**
 * Pass a packet if it fits any L2 protcol that the user has enabled.
 * @param {DataPoint} packet
 * @returns {Boolean}
 */
const passL2 = packet => {
  return (
    (appStore.globalFilters.ether && passEther(packet)) ||
    (appStore.globalFilters.profinet && passProfinet(packet)) ||
    (appStore.globalFilters.l2other && passL2Other(packet))
  );
};

/**
 * @param {DataPoint} packet
 * @returns {Boolean}
 */
const passL3 = packet => {
  return packet["L3Protocol"].length !== 0;
};

/**
 * Pass a packet if it fits any L4 protcol that the user has enabled.
 * @param {DataPoint} packet
 * @returns {Boolean}
 */
const passL4 = packet => {
  return (
    (appStore.globalFilters.tcp && passTCP(packet)) ||
    (appStore.globalFilters.udp && passUDP(packet)) ||
    (appStore.globalFilters.l4other && passL4Other(packet))
  );
};

/**
 * Return those packets that have been passed by one filter on each layer
 * @param {DataPoint[]} data
 * @returns {DataPoint[]}
 */
const applyGUIFiltersStrictly = data => {
  return data.filter(x => passL2(x) && passL3(x) && passL4(x));
};

/**
 * Return those packets that have been passed by any filter
 * @param {DataPoint[]} data
 * @returns {DataPoint[]}
 */
const applyGUIFiltersLoosely = data => {
  return data.filter(x => passL2(x) || passL3(x) || passL4(x));
};

export default {
  passEther,
  passProfinet,
  passL2Other,
  passL2,
  passL3,
  passTCP,
  passUDP,
  passL4Other,
  passL4,
  // applyGUIFilters,
  applyGUIFiltersStrictly,
  applyGUIFiltersLoosely,
};
