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
  flex: 1;
  align-self: flex-start;
  margin: 0.5rem 2rem;
`;

const PaperContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* height: 8rem; */
  /* padding: 0 1rem; */
  margin: 0.1rem;
`;

const StyledTypography = styled(Typography)`
  align-self: center;
`;

const StyledFormControl = styled(FormControl)`
  flex: 1;
  align-self: auto;
`;

const StyledFormGroup = styled(FormGroup)`
  height: 4rem;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  margin: 0.1rem;
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  flex: 1 1 2rem;
  align-self: flex-start;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
`;

@observer
class BrushConfig extends Component {
  handleChange = name => event => {
    appStore.updateBrushConfig(name)(event.target.checked);
  };

  render() {
    return (
      <Container>
        <Paper elevation={1}>
          <PaperContent>
            <StyledTypography variant="subheading" component="h3">
              Brush Config
            </StyledTypography>
            <Column>
              <StyledFormControl component="fieldset">
                <StyledFormGroup>
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
                </StyledFormGroup>
              </StyledFormControl>
            </Column>
          </PaperContent>
        </Paper>
      </Container>
    );
  }
}

export default BrushConfig;
