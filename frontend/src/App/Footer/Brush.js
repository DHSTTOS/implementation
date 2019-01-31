import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import * as d3 from 'd3';

// import { appStore, dataStore } from '@stores';

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
    // DO NOT TOUCH THE CODE ABOVE (except importing and change the bg color ofc)

    // use `this.brush.current` as the reference to the root node and that's it
    // reference dataStore or appStore as needed, there shouldn't be any problems

    d3.select(this.brush.current)
      .append('span')
      .text('Hole punched, D3 plugged in. :)');

    // do whatever you want :)

    // DO NOT TOUCH THE CODE BELOW
  };

  render() {
    return (
      <Container>
        <div ref={this.brush} />
      </Container>
    );
  }
}
