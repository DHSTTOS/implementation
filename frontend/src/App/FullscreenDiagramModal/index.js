import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { action } from 'mobx';
import styled from '@emotion/styled';
import Paper from '@material-ui/core/Paper';
import Modal from '@material-ui/core/Modal';

import { appStore } from '@stores';
import { Diagram } from '@components';
import DiagramControl from './DiagramControl';

const Container = styled(Paper)`
  position: absolute;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
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

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0.5rem;
  align-items: center;
`;

@observer
class FullscreenDiagramModal extends Component {
  @action
  handleCancel = () => {
    console.log('Fullscreen #' + appStore.fullscreenDiagram + ' exits.');
    appStore.resetFullscreenDiagram();
  };

  @action
  handleOK = () => {
    appStore.updateDiagram();
    appStore.closeConfigModal();
  };

  render() {
    !!appStore.fullscreenDiagram &&
      console.log(
        'Diagram ID #' + appStore.fullscreenDiagram + ' is set to fullscreen.'
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
                <Diagram config={config} isFullscreen />
              </StyledPaper>
            )}
          </Content>
        </Container>
      </Modal>
    );
  }
}

export default FullscreenDiagramModal;
