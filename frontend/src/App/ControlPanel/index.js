import React, { Component } from 'react';
import styled from '@emotion/styled';
import { observer } from 'mobx-react';
import { toJS } from 'mobx';

import { Logo, Column, Selector } from '@components';
import { dataStore } from '@stores';
import { requestAvailableCollections } from '@libs';

import GlobalFilters from './GlobalFilters';
import UserControl from './UserControl';

const Row = styled.div`
  display: flex;
  margin: 0 1rem;
  align-items: flex-start;
`;

@observer
class SourceSelector extends Component {
  selectSource = source => {
    dataStore.selectSource(source);
  };

  componentDidMount = () => {
    requestAvailableCollections();
  };

  render() {
    console.log(`I'll be damned `, toJS(dataStore.rawData));
    return (
      <Selector
        options={dataStore.sourceOptions}
        name={'Source'}
        onSelect={this.selectSource}
        currentSelection={dataStore.currentlySelectedSource}
        width={'15rem'}
      />
    );
  }
}

export default class ControlPanel extends Component {
  render() {
    return (
      <Row>
        <Column>
          <Logo />
          <SourceSelector />
        </Column>
        <GlobalFilters />
        <UserControl />
      </Row>
    );
  }
}
