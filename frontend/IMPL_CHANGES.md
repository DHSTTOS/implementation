# Changes From Design Docs

| Reasons     | Occurrences |
| -----       | ----- |
| Convenience | 1 |
| Aesthetics  | 1 |
| Usability Improvement | 3 |

## Login Page UI
    
### Changes

1. **[Aesthetics? Klevia help...]** Opted for a different graphical design than the one in the mockups due to aesthetic reasons. The functionality and behavior of the login page remains the same (apart from the second point below) as in the design docs.
2. **[Usability Improvement]** Added the feature of choosing an arbitrary WebSocket endpoint, making the frontend application completely standalone and therefore largely simplified the deploy process of the entire DHSTTOS suite.

### Variables

Used [browser local storage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) to persist the userinput of the WebSocket endpoint.

## Main Page UI
    
### Changes

1. **[Usability Improvement]** Removed the filter button inside diagram control containers. The filters now can be easily accessible inside the config modal of the diagram.
2. **[Usability Improvement]** Implemented the "maximize-diagram" (or "full screen") as a UI modal, which makes the user experience more fluid.

### Code

Necessary state observables and corresponding actions for the changes:

```js
  /**
   * ID of the currently full screen diagram. Empty means none.
   *
   * @type {string}
   */
  @observable
  fullscreenDiagram = '';

  @action
  resetFullscreenDiagram = () => {
    this.fullscreenDiagram = '';
  };
```

## Data Loading

### Changes

**[Convenience]** Added a helper function which converts the raw data points the frontend receives from the server to structured data arrays which allows easy data passing into the diagram drawing routines.

### Code

```js
/**
 * Formats raw data to a more structured manner based on the user's choice of axes and group.
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
  // normalize the timestamp
  const normalizedRawData = rawData.map(x => ({
    ...x,
    Timestamp: x['Timestamp']['$date'],
  }));

  // get all the names of groups of data by groupID
  const groups = new Set();
  normalizedRawData.forEach(e => groups.add(e[groupName]));
  const dataArr = [];
  groups.forEach(e => dataArr.push({ id: e, data: [] }));

  normalizedRawData.map(e => {
    dataArr
      .filter(o => o.id === e[groupName])
      .map(o => o.data.push({ x: e[x], y: e[y] }));
  });

  return dataArr;
};
```
