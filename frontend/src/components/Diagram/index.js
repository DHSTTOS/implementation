import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import Typography from '@material-ui/core/Typography';

import { formatData, SCATTER_PLOT, LINE_CHART } from '@libs';
import { appStore, dataStore } from '@stores';

import LineChartBlock from './LineChartBlock';
import ScatterPlotBlock from './ScatterPlotBlock';

const CenteredTypography = styled(Typography)`
  align-self: center;
`;

const PlotContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  margin: 0.5rem;
`;

/**
 * @typedef {object} Props
 * @prop {DiagramConfig} config
 * @prop {boolean} isFullscreen
 *
 * @extends {Component<Props>}
 */
@observer
class Diagram extends Component {
  render() {
    const { plotType, groupName, x, y } = this.props.config;
    const {
      colors,
      enableArea,
      lineWidth,
      areaOpacity,
      symbolSize,
    } = this.props.config.specConfig;

    const data = formatData({
      groupName,
      x,
      y,
      rawData: dataStore.currentlySelectedData,
    });
    console.log(data);

    let width, height;
    if (this.props.isFullscreen) {
      width = window.innerWidth * 0.9;
      height = window.innerHeight * 0.9;
    } else {
      width = appStore.diagramDimension.width;
      height = appStore.diagramDimension.height;
    }

    let plot = (
      <CenteredTypography variant="subtitle1" color="error">
        Unable to render diagram, please check configs
      </CenteredTypography>
    );

    switch (plotType) {
      case SCATTER_PLOT:
        plot = (
          <ScatterPlotBlock
            data={data}
            x={x}
            y={y}
            width={width}
            height={height}
            colors={colors}
            symbolSize={symbolSize}
          />
        );
        break;
      case LINE_CHART:
        plot = (
          <LineChartBlock
            data={data}
            x={x}
            y={y}
            width={width}
            height={height}
            colors={colors}
            enableArea={enableArea}
            lineWidth={lineWidth}
            areaOpacity={areaOpacity}
          />
        );
        break;
    }

    return <PlotContainer>{plot}</PlotContainer>;
  }
}

export default Diagram;
