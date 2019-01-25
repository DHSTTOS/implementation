import React, { Component } from "react";
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import { appStore } from "@stores";

const Container = styled(Paper)`
  display: flex;
  width: 43rem;
  height: 12rem;
  margin: 1rem 0.5rem 0;
`;

const Content = styled.div`
  flex: 1;
  margin: 0.5rem;
  /* background-color: pink; */
`;

/**
 * @typedef {object} Props
 * @prop {string} plotType
 *
 * @extends {Component<Props>}
 */
@observer
class DiagramSpecBlock extends Component {
  render() {
    return (
      <Container>
        <Content>
          <div />
        </Content>
      </Container>
    );
  }
}

export default DiagramSpecBlock;
