import React, { Component } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  bottom: 0;
  display: flex;
  height: 5rem;
  width: 65rem;
  background-color: pink;
`;

export default class Brush extends Component {
  render() {
    return <Container>I am brush.</Container>;
  }
}
