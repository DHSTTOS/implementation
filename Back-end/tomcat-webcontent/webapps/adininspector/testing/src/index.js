

const DataStore = {
  // TODO: when ws binding is done, we'll make this flexible
  //availableKeys = Object.keys(jsonstreams[0]);
  availableKeys = [];

  availableCollections: []; //exampleCollection

  // Raw network data
  rawdata: [];

  // Array of notification/alarm data sets:
  alarms: [
    {
      name: "",
      keys: [], // array of the JSON keys that this alarm type has
      data: [], // array of JSON strings representing the datapoints
    },
  ];
}

console.log("foo " + a.b);

