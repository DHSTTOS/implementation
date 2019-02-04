import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import styled from '@emotion/styled';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { appStore } from '@stores';

const Container = styled(Paper)`
  display: flex;
  width: 43rem;
  height: 12rem;
  margin: 0.5rem 0;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  /* justify-content: center; */
  margin: 0.5rem;
  /* background-color: pink; */
`;

const StyledFormControl = styled(FormControl)`
  flex: 1;
  align-self: auto;
`;

const StyledFormGroup = styled(FormGroup)`
  height: 7rem;
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
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
  /* background-color: red; */
`;

/**
 * @typedef {object} Props
 * @prop {number} diagramID
 *
 * @extends {Component<Props>}
 */
@observer
class DiagramFiltersBlock extends Component {
  handleChange = (category, name) => event => {
    appStore.updateSingleFilters(this.props.diagramID)(category, name)(
      event.target.checked
    );
  };

  render() {
    return (
      <Container>
        <Content>
          <Typography variant="subheading" component="h3">
            Diagram Filters
          </Typography>
        </Content>
      </Container>
    );
  }
}

export default DiagramFiltersBlock;
