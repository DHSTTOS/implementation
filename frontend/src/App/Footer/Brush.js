import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import * as d3 from 'd3';

const Container = styled.div`
  bottom: 0;
  display: flex;
  height: 5rem;
  width: 65rem;
  /* TODO: you can remove the background color now */
  background-color: pink;
`;

export default class Brush extends PureComponent {
  brush = React.createRef();

  componentDidMount = () => {
    // use `this.brush.current` as the reference to the root node and that's it
    d3.select(this.brush.current)
      .append('span')
      .text('Hole punched, D3 plugged in. :)');
  };

  render() {
    return (
      <Container>
        <div ref={this.brush} />
      </Container>
    );
  }
}
