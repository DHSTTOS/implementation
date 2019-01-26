import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "@emotion/styled";

import Selector from "./Selector";
import { dataStore } from "@stores";

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  /* background-color: lightblue; */
`;

@observer
class PlotTypeBar extends Component {
  // placeholderOptions = ["Option 1", "Option 2", "Option 3"];
  availablePlotTypes = ["Scatter Plot", "Line Chart"];
  render() {
    return (
      <Container>
        <Selector
          name="Plot Type"
          options={this.availablePlotTypes}
          onSelect={console.log}
        />
        <Selector
          name="X-Axis"
          options={dataStore.availableKeys}
          onSelect={console.log}
        />
        <Selector
          name="Y-Axis"
          options={dataStore.availableKeys}
          onSelect={console.log}
        />
        <Selector
          name="Group by"
          options={dataStore.availableKeys}
          onSelect={console.log}
        />
      </Container>
    );
  }
}

export default PlotTypeBar;
