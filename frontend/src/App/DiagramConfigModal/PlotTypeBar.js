import React, { Component } from "react";
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";

import { appStore } from "@stores";
import Selector from "./Selector";

const Container = styled.div`
  display: flex;
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
