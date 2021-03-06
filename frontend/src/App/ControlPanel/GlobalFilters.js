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
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 8rem;
  padding: 0 1rem;
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
  margin: 1rem;
`;

const StyledFormControlLabel = styled(FormControlLabel)`
  flex: 1 1 2rem;
  align-self: flex-start;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
`;

@observer
class GlobalFilters extends Component {
  handleChange = name => event => {
    appStore.updateGlobalFilters(name)(event.target.checked);
  };

  render() {
    return (
      <Container>
        <Paper elevation={1}>
          <PaperContent>
            <StyledTypography variant="subheading" component="h3">
              Global Filters
            </StyledTypography>
            <Row>
              <StyledFormControl component="fieldset">
                <StyledFormGroup>
                  <StyledFormControlLabel
                    control={
                      <Checkbox
                        checked={appStore.globalFilters.ether}
                        onChange={this.handleChange('ether')}
                        value="ether"
                      />
                    }
                    label="Ether"
                  />
                  <StyledFormControlLabel
                    control={
                      <Checkbox
                        checked={appStore.globalFilters.profinet}
                        onChange={this.handleChange('profinet')}
                        value="profinet"
                      />
                    }
                    label="Profinet"
                  />
                  <StyledFormControlLabel
                    control={
                      <Checkbox
                        checked={appStore.globalFilters.ip}
                        onChange={this.handleChange('ip')}
                        value="ip"
                      />
                    }
                    label="IP"
                  />
                  <StyledFormControlLabel
                    control={
                      <Checkbox
                        checked={appStore.globalFilters.tcp}
                        onChange={this.handleChange('tcp')}
                        value="tcp"
                      />
                    }
                    label="TCP"
                  />
                  <StyledFormControlLabel
                    control={
                      <Checkbox
                        checked={appStore.globalFilters.udp}
                        onChange={this.handleChange('udp')}
                        value="udp"
                      />
                    }
                    label="UDP"
                  />
                </StyledFormGroup>
              </StyledFormControl>
            </Row>
          </PaperContent>
        </Paper>
      </Container>
    );
  }
}

export default GlobalFilters;
