import React, { Component } from 'react';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';

import styled from '@emotion/styled';
import { appStore } from '@stores';

const Container = styled.div`
  display: flex;
  width: 100%;
`;

const ControlWrapper = styled.div`
  display: flex;
  flex: 1;
  margin: 0.5rem 0.5rem 0 0.5rem;
  justify-content: flex-end;
`;

/**
 * @typedef {object} Props
 * @prop {number} diagramID
 *
 * @extends {Component<Props>}
 */
export default class DiagramControl extends Component {
  handleSettings = () => {
    appStore.openConfigModal(this.props.diagramID);
  };
  handleExitFullscreen = () => {
    appStore.resetFullscreenDiagram();
  };

  render() {
    return (
      <Container>
        <ControlWrapper>
          <IconButton onClick={this.handleSettings}>
            <Icon>settings</Icon>
          </IconButton>
          <IconButton onClick={this.handleExitFullscreen}>
            <Icon>fullscreen_exit</Icon>
          </IconButton>
        </ControlWrapper>
      </Container>
    );
  }
}
