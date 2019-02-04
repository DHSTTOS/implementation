import React, { Component } from 'react';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';

import styled from '@emotion/styled';
import { appStore } from '@stores';

const Container = styled.div`
  display: flex;
  width: 100%;
  /* background-color: pink; */
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
  handleFullscreen = () => {
    appStore.fullscreenDiagram = this.props.diagramID;
  };
  handleClose = () => {
    appStore.closeDiagram(this.props.diagramID);
  };

  render() {
    return (
      <Container>
        <ControlWrapper>
          <IconButton onClick={this.handleSettings}>
            <Icon>settings</Icon>
          </IconButton>
          <IconButton onClick={this.handleFullscreen}>
            <Icon>fullscreen</Icon>
          </IconButton>
          <IconButton onClick={this.handleClose}>
            <Icon>close</Icon>
          </IconButton>
        </ControlWrapper>
      </Container>
    );
  }
}
