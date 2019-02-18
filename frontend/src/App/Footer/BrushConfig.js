import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styled from '@emotion/styled';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { appStore } from '@stores';

const Container = styled.div`
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: left;
  height: 5rem;
  margin: 0 1rem;
`;

@observer
class BrushConfig extends Component {
  handleChange = name => event => {
    appStore.updateBrushConfig(name)(event.target.checked);
  };

  render() {
    return (
      <Container>
        <FormControlLabel
          control={
            <Checkbox
              checked={appStore.brushConfig.smoothScroll}
              onChange={this.handleChange('smoothScroll')}
              value="smoothScroll"
            />
          }
          label="Smooth scroll"
        />
        <FormControlLabel
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
