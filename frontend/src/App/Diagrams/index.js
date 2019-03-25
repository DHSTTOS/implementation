import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

import { appStore } from '@stores';
import { Diagram } from '@components';
import DiagramControl from './DiagramControl';

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-self: stretch;
  margin: 0.5rem;
`;

const BottomPad = styled.div`
  height: 5rem;
  width: 100%;
`;

const StyledPaper = styled(Paper)`
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  margin: 0.5rem;
  user-select: none;
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

export default DiagramsContainer;
