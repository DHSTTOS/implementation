import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "@emotion/styled";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import AddBoxIcon from "@material-ui/icons/AddBox";

import { appStore } from "@stores";

const Container = styled.div`
  display: flex;
  margin: 0 1rem;
  justify-content: space-between;
  align-items: center;
`;

const StyledAddBoxIcon = styled(AddBoxIcon)`
  margin-right: 0.5rem;
`;

@observer
class Footer extends Component {
  handleAddDiagram = () => {
    appStore.diagramConfigModal = {
      isOpen: true,
      diagramID: appStore.diagramConfigs.length,
    };
  };

  render() {
    return (
      <Container>
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
      </Container>
    );
  }
}

export default Footer;
