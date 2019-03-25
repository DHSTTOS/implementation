import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { observable, action } from 'mobx';
import styled from '@emotion/styled';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';

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
  margin: 0.5rem;
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
