import React, { Component } from 'react';
import styled from '@emotion/styled';
import Button from '@material-ui/core/Button';
import ExitIcon from '@material-ui/icons/ExitToApp';
import { userStore } from '@stores';

const Container = styled.div`
  margin-top: 0.5rem;
`;

const StyledExitIcon = styled(ExitIcon)`
  margin-right: 0.5rem;
`;

export default class UserControl extends Component {
  render() {
    return (
      <Container>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => {
            userStore.userLogout;
            window.location.href = '../';
          }}
        >
          <StyledExitIcon />
          Sign Out
        </Button>
      </Container>
    );
  }
}
