import React, { Component } from "react";
import { observer } from "mobx-react";
import { action } from "mobx";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";

import { appStore } from "@stores";
import { jsonstreams } from "../../../mockdata";
import { formatData, SCATTER_PLOT, LINE_CHART } from "@libs";
import DiagramControl from "./DiagramControl";
import LineChartBlock from "./LineChartBlock";
import ScatterPlotBlock from "./ScatterPlotBlock";

const Container = styled(Paper)`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* transform: translate(-50%, -50%); */
`;

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

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 10rem;
  margin: 1rem;
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

const Center = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0.5rem;
  align-items: center;
  /* background-color: pink; */
`;

const ModalHeader = styled.div`
  margin: 0.5rem;
  /* background-color: red; */
`;

@observer
class FullscreenDiagramModal extends Component {
  @action
  handleCancel = () => {
    console.log(
      "Config modal #" +
        appStore.configModal.diagramConfig.diagramID +
        " is canceled."
    );
    appStore.closeConfigModal();
  };

  @action
  handleOK = () => {
    appStore.updateDiagram();
    appStore.closeConfigModal();
  };

  render() {
    !!appStore.fullscreenDiagram &&
      console.log(
        "Diagram ID #" + appStore.fullscreenDiagram + " is set to fullscreen."
      );
    const config = appStore.diagramConfigs.find(
      x => x.diagramID === appStore.fullscreenDiagram
    );

    return (
      <Modal open={!!appStore.fullscreenDiagram} onClose={this.handleCancel}>
        <Container>
          <Content>
            {config && (
              <StyledPaper elevation={1} key={config.diagramID}>
                <DiagramControl diagramID={config.diagramID} />
                <Diagram config={config} />
              </StyledPaper>
            )}
          </Content>
        </Container>
      </Modal>
    );
  }
}

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

export default FullscreenDiagramModal;
