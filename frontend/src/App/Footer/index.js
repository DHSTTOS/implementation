import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "@emotion/styled";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import AddBoxIcon from "@material-ui/icons/AddBox";

import { appStore } from "@stores";

const Container = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  height: 5rem;
  width: 100%;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
  margin: 0 1rem;
  padding: 0 2rem;
  justify-content: space-between;
  align-items: center;
`;

const StyledAddBoxIcon = styled(AddBoxIcon)`
  margin-right: 0.5rem;
`;

@observer
class Footer extends Component {
  handleAddDiagram = () => {
    appStore.openConfigModal(appStore.diagramConfigs.length);
  };

  render() {
    return (
      <Container>
        <Content>
          <Typography variant="body1" color="textSecondary">
            {"© 2018 ADIN Frontend Contributors"}
          </Typography>
          <Button
            onClick={this.handleAddDiagram}
            variant="contained"
            color="primary"
          >
            <StyledAddBoxIcon />
            Add Diagram
          </Button>
        </Content>
      </Container>
    );
  }
}

export default Footer;
