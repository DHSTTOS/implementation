import React, { Component } from "react";
import { observer } from "mobx-react";
import { action } from "mobx";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";

import { appStore } from "@stores";

import DiagramControl from "./DiagramControl";
import LineChartBlock from "./LineChartBlock";
import ScatterPlotBlock from "./ScatterPlotBlock";

const Container = styled(Paper)`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  top: 50%;
  left: 50%;
  width: 45rem;
  height: 40rem;
  transform: translate(-50%, -50%);
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 10rem;
  margin: 1rem;
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

export default FullscreenDiagramModal;
