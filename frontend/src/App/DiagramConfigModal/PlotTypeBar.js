import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "@emotion/styled";

import Selector from "./Selector";
import { dataStore } from "@stores";
import { SCATTER_PLOT, LINE_CHART } from "@libs";

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
  availablePlotTypes = [SCATTER_PLOT, LINE_CHART];

  render() {
    const availableKeys = dataStore.availableKeys;
    return (
      <Container>
        <Selector
          name="Plot Type"
          options={this.availablePlotTypes}
          onSelect={console.log}
        />
        <Selector
          name="X-Axis"
          options={availableKeys}
          onSelect={console.log}
        />
        <Selector
          name="Y-Axis"
          options={availableKeys}
          onSelect={console.log}
        />
        <Selector
          name="Group by"
          options={availableKeys}
          onSelect={console.log}
        />
      </Container>
    );
  }
}

export default PlotTypeBar;
