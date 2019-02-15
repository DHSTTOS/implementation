import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';

import { Selector } from '@components';
import { dataStore, appStore } from '@stores';
import { SCATTER_PLOT, LINE_CHART, NODE_LINK } from '@libs';

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
  availablePlotTypes = [SCATTER_PLOT, LINE_CHART, NODE_LINK];

  render() {
    const availableKeys = dataStore.availableKeys;
    const diagramConfig = appStore.configModal.diagramConfig;
    return (
      <Container>
        <Selector
          name="Plot Type"
          options={this.availablePlotTypes}
          onSelect={appStore.setPlotType}
          currentSelection={diagramConfig.plotType}
        />

        {diagramConfig.plotType == SCATTER_PLOT ? (
          
          <>
            <Selector
              name="X-Axis"
              //we have the option .slice(start,end)
              options={availableKeys.slice(3,10)}
              onSelect={appStore.setXAxis}
              currentSelection={diagramConfig.x}
            />
            <Selector
              name="Y-Axis"
              options={availableKeys.slice(3,10)}
              onSelect={appStore.setYAxis}
              currentSelection={diagramConfig.y}
            />
            <Selector
              name="Group by"
              options={availableKeys.slice(3,10)}
              onSelect={appStore.setGroupBy}
              currentSelection={diagramConfig.groupName}
            />
          </>
        ) : (
          <></>
        )}

{diagramConfig.plotType == LINE_CHART? (
          
          <>
            <Selector
              name="X-Axis"
              //we have the option .slice(start,end)
              options={availableKeys.slice(1,4)}
              onSelect={appStore.setXAxis}
              currentSelection={diagramConfig.x}
            />
            <Selector
              name="Y-Axis"
              options={availableKeys.slice(1,4)}
              onSelect={appStore.setYAxis}
              currentSelection={diagramConfig.y}
            />
            <Selector
              name="Group by"
              options={availableKeys.slice(1,4)}
              onSelect={appStore.setGroupBy}
              currentSelection={diagramConfig.groupName}
            />
          </>
        ) : (
          <></>
        )}
      </Container>
    );
  }
}

export default PlotTypeBar;
