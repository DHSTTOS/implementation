import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { appStore } from '@stores';

const Container = styled.div`
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: left;
  height: 5rem;
  width: 20rem;
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  flex: 1 1 2rem;
  align-self: flex-start;
`;

@observer
class BrushConfig extends Component {
  handleChange = name => event => {
    appStore.updateBrushConfig(name)(event.target.checked);
  };

  render() {
    return (
      <Container>
        <StyledFormControlLabel
          control={
            <Checkbox
              checked={appStore.brushConfig.smoothScroll}
              onChange={this.handleChange('smoothScroll')}
              value="smoothScroll"
            />
          }
          label="Smooth scroll"
        />
        <StyledFormControlLabel
          control={
            <Checkbox
              checked={appStore.brushConfig.tickstyle}
              onChange={this.handleChange('tickstyle')}
              value="tickstyle"
            />
          }
          label="Tickstyle"
        />
      </Container>
    );
  }
}

export default BrushConfig;
