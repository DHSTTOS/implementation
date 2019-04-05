import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';

import { Selector } from '@components';
import { dataStore, appStore } from '@stores';
import { SCATTER_PLOT, LINE_CHART, LINE_CHART_LAYER, NODE_LINK } from '@libs';

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

@observer
class PlotTypeBar extends Component {
  availablePlotTypes = [SCATTER_PLOT, LINE_CHART, LINE_CHART_LAYER, NODE_LINK];

  render() {
    const availableKeys = [...dataStore.availableKeys];
    const diagramConfig = appStore.configModal.diagramConfig;
    return (
      <Container>
        <Selector
          name="Plot Type"
          options={this.availablePlotTypes}
          onSelect={appStore.setPlotType}
          currentSelection={diagramConfig.plotType}
        />

        {diagramConfig.plotType === SCATTER_PLOT ? (
          <>
            <Selector
              name="X-Axis"
              options={availableKeys}
              onSelect={appStore.setXAxis}
              currentSelection={diagramConfig.x}
            />
            <Selector
              name="Y-Axis"
              options={availableKeys}
              onSelect={appStore.setYAxis}
              currentSelection={diagramConfig.y}
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
