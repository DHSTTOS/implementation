import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import { appStore } from "@stores";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  align-self: stretch;
  margin: 0.5rem;
  height: 20rem;
`;

const StyledPaper = styled(Paper)`
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
        {appStore.diagramConfigs.length === 0 ? (
          <StyledPaper elevation={1}>
            <CenteredTypography variant="subtitle1" color="textSecondary">
              Please add a diagram
            </CenteredTypography>
          </StyledPaper>
        ) : (
          appStore.diagramConfigs.map(config => (
            <StyledPaper elevation={1} key={config.diagramID}>
              <Diagram config={config} />
            </StyledPaper>
          ))
        )}
      </Container>
    );
  }
}

class Diagram extends Component {
  render() {
    return (
      <div>
        This diagram has configs:
        <pre>{JSON.stringify(this.props.config, null, 2)}</pre>
      </div>
    );
  }
}

export default DiagramsContainer;
