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
 * @property {string} Direction
 * @property {number} count
 * @property {string} MAC
 */

/**
 * Formats raw data to nivo's format.
 *
 * @param {Object} p
 * @param {string} p.x
 * @param {string} p.y
 * @param {Object} p.globalFilters
 * @param {RawDatum[]} p.unformattedData
 *
 * @return {Object[]}
 */
const formatRawData = ({
  x,
  y,
  globalFilters,
  unformattedData: rawData = [],
}) => {
  // normalize the timestamp
  const normalized = rawData.map(x => ({
    ...x,
    Timestamp: String(new Date(x['Timestamp']['$date']).getTime()),
    id: Number(x['_id']['$numberLong']),
  }));

  console.log('Global Filters: ', { ...globalFilters });

  let formatted = [];
  const groups = new Set();

  const filtered = normalized.filter(
    x =>
      (globalFilters.tcp && x['L4Protocol'] === 'TCP') ||
      (globalFilters.udp && x['L4Protocol'] === 'UDP') ||
      (globalFilters.ip && x['L3Protocol'] === 'IP') ||
      (globalFilters.ether && x['L2Protocol'] === 'Ether') ||
      (globalFilters.profinet && x['L2Protocol'] === 'Profinet')
  );

  filtered.forEach(x => {
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
 * Formats connections per second per layer data to nivo's format.
 *
 * @param {ConnectionsPerSecondPerLayerDatum[]} cpsLayerData
 *
 * @return {Object[]}
 */
const formatConnectionratePerLayerData = (cpsLayerData = []) => {
  // normalize the timestamp
  const normalized = cpsLayerData.map(x => ({
    ...x,
    date: String(new Date(x['date']['$date']).getTime()),
    id: Number(x['_id']['$numberLong']),
  }));

  const groups = {};

  normalized.forEach(d => {
    // Use default records with y=0 to fill in records where one or more
    // layer were not present (because there was no network traffic on
    // those layer in that time range).
    // This filling in of default values could also be done in the
    // aggregator on the back end instead of here.
    let record = {};
    record['L2'] = { x: d.date, y: 0 };
    record['L3'] = { x: d.date, y: 0 };
    record['L4'] = { x: d.date, y: 0 };
    d.connections.forEach(e => {
      record[e.Layer] = { x: d.date, y: e.count };
    });
    for (let layer in record) {
      if (!(layer in groups)) {
        groups[layer] = { data: [record[layer]] };
      } else {
        groups[layer].data = [...groups[layer].data, record[layer]];
      }
    }
  });

  // Sort the layers so that the diagram legend will be sorted.
  const macs = Object.keys(groups)
    .sort()
    .reverse();
  return macs.map(x => ({
    id: x,
    data: groups[x].data,
  }));
};

/**
 * Formats flowrate data to nivo's format.
 *
 * @param {FlowRatePerSecondDatum[]} flowrateData
 *
 * @return {Object[]}
 */
const formatFlowrateData = (flowrateData = []) => {
  // normalize the timestamp
  const normalized = flowrateData.map(x => ({
    ...x,
    date: String(new Date(x['date']['$date']).getTime()),
    id: Number(x['_id']['$numberLong']),
  }));

  const groups = {};

  normalized.forEach(d => {
    d.connections.forEach(e => {
      if (!(e.MAC in groups)) {
        groups[e.MAC] = { data: [{ x: d.date, y: e.count }] };
      } else {
        groups[e.MAC].data = [...groups[e.MAC].data, { x: d.date, y: e.count }];
      }
    });
  });

  const macs = Object.keys(groups);
  return macs.map(x => ({
    id: x,
    data: groups[x].data,
  }));
};

const formatNodeLinkData = (nodeLinkData = {}) => {
  const { nodes, links } = nodeLinkData;
  return { nodes, links };
};

export {
  formatRawData,
  formatConnectionratePerLayerData,
  formatFlowrateData,
  formatNodeLinkData,
};
