import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "@emotion/styled";

import Selector from "./Selector";

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  /* background-color: lightblue; */
`;

@observer
class PlotTypeBar extends Component {
  sourceOptions = ["Option 1", "Option 2", "Option 3"];

  render() {
    return (
      <Container>
        <Selector
          name="Plot Type"
          options={this.sourceOptions}
          onSelect={console.log}
        />
        <Selector
          name="X-Axis"
          options={this.sourceOptions}
          onSelect={console.log}
        />
        <Selector
          name="Y-Axis"
          options={this.sourceOptions}
          onSelect={console.log}
        />
        <Selector
          name="Group by"
          options={this.sourceOptions}
          onSelect={console.log}
        />
      </Container>
    );
  }
}

export default PlotTypeBar;
