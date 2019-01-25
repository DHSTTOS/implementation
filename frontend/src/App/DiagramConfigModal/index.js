import React, { Component } from "react";
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";

import { appStore } from "@stores";

import PlotTypeBar from "./PlotTypeBar";
import DiagramSpecBlock from "./DiagramSpecBlock";
import DiagramFiltersBlock from "./DiagramFiltersBlock";

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
class DiagramConfigModal extends Component {
  @action
  handleCancel = () => {
    appStore.closeConfigModal();
  };

  @action
  handleOK = () => {
    const currentDiagramID = appStore.diagramConfigModal.diagramID;

    if (currentDiagramID >= appStore.diagramConfigs.length) {
      appStore.addNewDiagram(this.currentConfig);
      console.log(`Diagram #${currentDiagramID} is saved.`);
    } else {
      appStore.updateDiagram(currentDiagramID)(this.currentConfig);
    }
    appStore.closeConfigModal();
  };

  @observable
  currentConfig = {
    isAwesome: true,
  };

  render() {
    return (
      <Modal
        open={appStore.diagramConfigModal.isOpen}
        onClose={this.handleCancel}
      >
        <Container>
          <ModalHeader>
            <Typography variant="h6" align={"center"}>
              Configure Diagram ID #{appStore.diagramConfigModal.diagramID}
            </Typography>
          </ModalHeader>
          <Content>
            <PlotTypeBar />
            <DiagramSpecBlock />
            <DiagramFiltersBlock />
          </Content>
          <Center>
            <ButtonsContainer>
              <Button
                onClick={this.handleOK}
                variant="contained"
                color="primary"
              >
                Save
              </Button>
              <Button
                onClick={this.handleCancel}
                variant="contained"
                color="secondary"
              >
                Cancel
              </Button>
            </ButtonsContainer>
          </Center>
        </Container>
      </Modal>
    );
  }
}

export default DiagramConfigModal;
