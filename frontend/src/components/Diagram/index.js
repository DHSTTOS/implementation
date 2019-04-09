import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import Typography from '@material-ui/core/Typography';

import {
  SCATTER_PLOT,
  LINE_CHART,
  LINE_CHART_LAYER,
  NODE_LINK,
  formatRawData,
  formatFlowrateData,
  formatConnectionratePerLayerData,
  findConnectionMax,
} from '@libs';
import { appStore, dataStore } from '@stores';

import LineChartBlock from './LineChartBlock';
import ScatterPlotBlock from './ScatterPlotBlock';
import NodeLinkBlock from './NodeLinkBlock';

const CenteredTypography = styled(Typography)`
  align-self: center;
  user-select: none;
`;

const PlotContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  min-height: 15rem;
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
    if (this.props.config.plotType === NODE_LINK) {
      return (
        <PlotContainer>
          {!this.props.isFullscreen ? (
            <CenteredTypography variant="subtitle1" color="error">
              Please toggle full screen mode to see the node link diagram
            </CenteredTypography>
          ) : (
            <NodeLinkBlock />
          )}
        </PlotContainer>
      );
    }

    const { plotType, x, y } = this.props.config;
    const {
      enableArea,
      lineWidth,
      areaOpacity,
      symbolSize,
      enableDynamicScaling,
    } = this.props.config.specConfig;

    let data;
    let unformattedData;
    let yScaleMin = 'auto';
    let yScaleMax = 'auto';
    switch (this.props.config.plotType) {
      case SCATTER_PLOT:
        unformattedData = dataStore.currentlySelectedRawData;

        data = formatRawData({
          globalFilters: appStore.globalFilters,
          x,
          y,
          unformattedData,
        });
        console.log('Diagram.formatRawData ==============');
        console.log(
          'unformattedData, data.length: ' +
            unformattedData.length +
            ', ' +
            data.length
        );
        console.log(data);
        break;
      case LINE_CHART:
        unformattedData = dataStore.currentlySelectedFlowrateData;
        data = formatFlowrateData(unformattedData);
        break;
      case LINE_CHART_LAYER:
        unformattedData = dataStore.currentlySelectedConnectionNumberData;
        data = formatConnectionratePerLayerData(unformattedData);
        if (!enableDynamicScaling) {
          yScaleMin = 0;
          // XXX the following function call to findConnectionMax()
          // should be done as e.g. autorun and run as a reaction to a
          // change in dataStore.connectionNumberData :
          dataStore.connectionNumberDataMax = findConnectionMax(
            dataStore.connectionNumberData
          );
          yScaleMax = dataStore.connectionNumberDataMax;
        }
        break;
    }

    // console.warn(data);

    let width, height;
    if (this.props.isFullscreen) {
      width = window.innerWidth * 0.9;
      height = window.innerHeight * 0.9;
    } else {
      width = window.innerWidth * 0.9;
      // width = appStore.diagramDimension.width;
      height = window.innerHeight * 0.61;
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
            symbolSize={symbolSize}
          />
        );
        break;
      case LINE_CHART:
        plot = (
          <LineChartBlock
            data={data}
            width={width}
            height={height}
            enableArea={enableArea}
            lineWidth={lineWidth}
            areaOpacity={areaOpacity}
            yScaleMin={yScaleMin}
            yScaleMax={yScaleMax}
          />
        );
        break;
      case LINE_CHART_LAYER:
        plot = (
          <LineChartBlock
            data={data}
            width={width}
            height={height}
            enableArea={enableArea}
            lineWidth={lineWidth}
            areaOpacity={areaOpacity}
            yScaleMin={yScaleMin}
            yScaleMax={yScaleMax}
          />
        );
        break;
    }

    return <PlotContainer>{plot}</PlotContainer>;
  }
}

export default Diagram;
