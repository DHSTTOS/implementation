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

  const formatted = [];

  switch (highestLayer) {
    case 'L4Protocol':
      const l4Groups = new Set();
      const l3Groups = new Set();
      const l2Groups = new Set();
      const l4Data = [];
      const l3Data = [];
      const l2Data = [];
      normalized.forEach(d => {
        if (d['L4Protocol']) {
          l4Groups.add(d['L4Protocol']);
          l4Data = [...l4Data, d];
          return;
        }
        if (d['L3Protocol']) {
          l3Groups.add(d['L3Protocol']);
          l3Data = [...l3Data, d];
          return;
        }
        if (d['L2Protocol']) {
          l2Groups.add(d['L2Protocol']);
          l2Data = [...l2Data, d];
          return;
        }
      });

      l4Groups.forEach(group => {
        formatted.push({ id: group, data: [] });
      });
      normalized.reduce(
        ([l4, others], d) => {
          d['L4Protocol'] ? [[...l4, d], others] : [l4, [...others, d]];
        },
        [[], []]
      );

      l3Groups.forEach(group => {
        formatted.push({ id: group, data: [] });
      });
      normalized.reduce(
        ([l3, others], d) => {
          d['L3Protocol'] ? [[...l3, d], others] : [l3, [...others, d]];
        },
        [[], []]
      );

      // normalized.forEach(d => {
      //   formatted
      //     .filter(o => o.id === d[groupName])
      //     .map(o => o.data.push({ x: d[x], y: d[y], id: d['id'] }));
      // });

      break;
    case 'L3Protocol':
      break;
    case 'L2Protocol':
      break;
  }

  return formatted;
};

export default { formatRawData };
