import React, { Component } from "react";
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";

import { appStore } from "@stores";

const Container = styled(Paper)`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 45rem;
  height: 35rem;
  transform: translate(-50%, -50%);
`;

@observer
class DiagramConfigModal extends Component {
  @action
  handleCancel = () => {
    appStore.diagramConfigModal = {
      isOpen: false,
      diagramID: -1,
    };
  };

  @action
  handleOK = () => {
    if (
      appStore.diagramConfigModal.diagramID >= appStore.diagramConfigs.length
    ) {
      // add new diagram
      appStore.diagramConfigs.push({
        // consider alias this observable in this class to save characters
        diagramID: appStore.diagramConfigModal.diagramID,
        ...this.currentConfig,
      });
      console.log(appStore.diagramConfigModal.diagramID);
    } else {
      // modify config of existing diagram
      appStore.diagramConfigs = appStore.diagramConfigs.map(config =>
        config.diagramID === appStore.diagramConfigModal.diagramID
          ? {
              diagramID: appStore.diagramConfigModal.diagramID,
              ...this.currentConfig,
            }
          : config
      );
    }
    appStore.diagramConfigModal = {
      isOpen: false,
      diagramID: -1,
    };
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
          <Typography variant="h6">
            Configuring Diagram ID #{appStore.diagramConfigModal.diagramID}
          </Typography>
          <Button onClick={this.handleOK} variant="contained" color="primary">
            Save
          </Button>
        </Container>
      </Modal>
    );
  }
}

export default DiagramConfigModal;
