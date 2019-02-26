/**
 * @typedef RawDatum
 * @type {Object}
 * @property {ID} _id
 * @property {string} L2Protocol
 * @property {string} SourceMACAddress
 * @property {string} L4Protocol
 * @property {string} SourceIPAddress
 * @property {string} PacketSummary
 * @property {number} PacketID
 * @property {string} DestinationIPAddress
 * @property {Timestamp} Timestamp
 * @property {string} DestinationPort
 * @property {string} SourcePort
 * @property {string} L3Protocol
 * @property {string} DestinationMACAddress
 */

/**
 * @typedef FlowRatePerSecondDatum
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
 * @property {string} direction
 * @property {number} count
 * @property {string} MAC
 */

/**
 * Formats raw data to nivo's format.
 *
 * @param {Object} p
 * @param {string} p.x
 * @param {string} p.y
 * @param {string} p.highestLayer
 * @param {RawDatum[]} p.unformattedData
 *
 * @return {Object[]}
 */
const formatRawData = ({
  x,
  y,
  highestLayer,
  unformattedData: rawData = [],
}) => {
  // normalize the timestamp
  const normalized = rawData.map(x => ({
    ...x,
    Timestamp: x['Timestamp']['$date'],
    id: Number(x['_id']['$numberLong']),
  }));

  let formatted = [];
  const groups = new Set();

  switch (highestLayer) {
    case 'L4Protocol':
      normalized.forEach(x => {
        if (x['L4Protocol']) {
          const datum = { ...x, group: x['L4Protocol'] };
          groups.add(datum.group);
          formatted = [...formatted, datum];
          return;
        }
        if (x['L3Protocol']) {
          const datum = { ...x, group: x['L3Protocol'] };
          groups.add(datum.group);
          formatted = [...formatted, datum];
          return;
        }
        if (x['L2Protocol']) {
          const datum = { ...x, group: x['L2Protocol'] };
          groups.add(datum.group);
          formatted = [...formatted, datum];
          return;
        }
      });
      break;
    case 'L3Protocol':
      normalized.forEach(x => {
        if (x['L3Protocol']) {
          const datum = { ...x, group: x['L3Protocol'] };
          groups.add(datum.group);
          formatted = [...formatted, datum];
          return;
        }
        if (x['L2Protocol']) {
          const datum = { ...x, group: x['L2Protocol'] };
          groups.add(datum.group);
          formatted = [...formatted, datum];
          return;
        }
      });
      break;
    case 'L2Protocol':
      normalized.forEach(x => {
        if (x['L2Protocol']) {
          const datum = { ...x, group: x['L2Protocol'] };
          groups.add(datum.group);
          formatted = [...formatted, datum];
          return;
        }
      });
      break;
  }

  let grouped = Array.from(groups).map(key => ({ id: key, data: [] }));

  return formatted.reduce((prev, curr) => {
    const group = curr.group;
    curr = { x: curr[x], y: curr[y], id: curr.id };
    return prev.map(x =>
      x.id !== group ? x : { id: x.id, data: [...x.data, curr] }
    );
  }, grouped);
};

/**
 * Finds the group of given raw data point.
 *
 * @param {Object} p
 * @param {string} p.highestLayer
 * @param {RawDatum} p.datum
 *
 * @return {string}
 */
const findDatumGroup = ({ highestLayer, datum }) => {
  switch (highestLayer) {
    case 'L4Protocol':
      if (x['L4Protocol']) {
        return x['L4Protocol'];
      }
      if (x['L3Protocol']) {
        return x['L3Protocol'];
      }
      if (x['L2Protocol']) {
        return x['L2Protocol'];
      }
      break;
    case 'L3Protocol':
      if (x['L3Protocol']) {
        return x['L3Protocol'];
      }
      if (x['L2Protocol']) {
        return x['L2Protocol'];
      }
      break;
    case 'L2Protocol':
      if (x['L2Protocol']) {
        return x['L2Protocol'];
      }
      break;
  }
};

export default { formatRawData, findDatumGroup };
