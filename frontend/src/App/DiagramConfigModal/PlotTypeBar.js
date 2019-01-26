import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "@emotion/styled";

import Selector from "./Selector";
import { dataStore, appStore } from "@stores";
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

  selectPlotType = plotType => {
    appStore.configModal.diagramConfig.plotType = plotType;
  };
  selectXAxis = x => {
    appStore.configModal.diagramConfig.x = x;
  };
  selectYAxis = y => {
    appStore.configModal.diagramConfig.y = y;
  };
  selectGroupBy = groupName => {
    appStore.configModal.diagramConfig.groupName = groupName;
  };

  render() {
    const availableKeys = dataStore.availableKeys;
    return (
      <Container>
        <Selector
          name="Plot Type"
          options={this.availablePlotTypes}
          onSelect={this.selectPlotType}
        />
        <Selector
          name="X-Axis"
          options={availableKeys}
          onSelect={this.selectXAxis}
        />
        <Selector
          name="Y-Axis"
          options={availableKeys}
          onSelect={this.selectYAxis}
        />
        <Selector
          name="Group by"
          options={availableKeys}
          onSelect={this.selectGroupBy}
        />
      </Container>
    );
  }
}

export default PlotTypeBar;
