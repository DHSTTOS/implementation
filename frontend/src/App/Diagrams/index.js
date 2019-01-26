import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import { appStore } from "@stores";
import { jsonstreams } from "../../../mockdata";
import { formatData, SCATTER_PLOT, LINE_CHART } from "@libs";
import DiagramControl from "./DiagramControl";
import ScatterPlotBlock from "./ScatterPlotBlock";

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  align-self: stretch;
  margin: 0.5rem;
  /* height: 20rem; */
`;

const BottomPad = styled.div`
  height: 3rem;
  width: 100%;
  /* background-color: red; */
`;

const StyledPaper = styled(Paper)`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  margin: 0.5rem;
`;

const PlotContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  margin: 0.5rem;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
`;

const CenteredTypography = styled(Typography)`
  align-self: center;
`;

@observer
class DiagramsContainer extends Component {
  render() {
    return (
      <Container>
        <Content>
          {appStore.diagramConfigs.length === 0 ? (
            <StyledPaper elevation={1}>
              <CenteredTypography variant="subtitle1" color="textSecondary">
                Please add a diagram
              </CenteredTypography>
            </StyledPaper>
          ) : (
            appStore.diagramConfigs.map(config => (
              <StyledPaper elevation={1} key={config.diagramID}>
                <DiagramControl diagramID={config.diagramID} />
                <Diagram config={config} />
              </StyledPaper>
            ))
          )}
        </Content>
        <BottomPad />
      </Container>
    );
  }
}

@observer
class Diagram extends Component {
  render() {
    const { plotType, groupName, x, y } = this.props.config;
    const data = formatData({
      groupName,
      x,
      y,
      rawData: jsonstreams,
    });
    console.log(data);

    const { width, height } = appStore.diagramDimension;

    let plot = (
      <CenteredTypography variant="subtitle1" color="error">
        Enable to render diagram, please check configs
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
          />
        );
        break;
    }

    return <PlotContainer>{plot}</PlotContainer>;
  }
}

export default DiagramsContainer;
