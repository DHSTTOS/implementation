import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AddBoxIcon from '@material-ui/icons/AddBox';
import uniqid from 'uniqid';

import { appStore } from '@stores';
import Brush from './Brush';
import BrushConfig from './BrushConfig';

const Container = styled.div`
  position: fixed;
  bottom: 0;
  display: flex;
  height: 6rem;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.75);
  user-select: none;
`;

const Content = styled.div`
  flex: 1;
  display: grid;
  align-items: center;
  justify-items: center;
  margin: 0 1rem;
  padding: 0 2rem;
  grid-template-columns: 10rem auto 10rem;
`;

const StyledAddBoxIcon = styled(AddBoxIcon)`
  margin-right: 0.5rem;
`;

const Row = styled.div`
  display: flex;
`;

@observer
class Footer extends Component {
  handleAddDiagram = () => {
    appStore.openConfigModal(uniqid());
  };

  render() {
    return (
      <Container>
        <Content>
          <div>
            <Typography variant="body1" color="textSecondary">
              {'© 2018-2019 DHSTTOS Frontend Contributors'}
            </Typography>
          </div>
          <Row>
            <BrushConfig />
            <Brush />
          </Row>
          <div>
            <Button
              onClick={this.handleAddDiagram}
              variant="contained"
              color="primary"
            >
              <StyledAddBoxIcon />
              Add Diagram
            </Button>
          </div>
        </Content>
      </Container>
    );
  }
}

export default Footer;
