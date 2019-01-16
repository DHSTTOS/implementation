import React, { Component } from "react";
import styled from "@emotion/styled";

import GlobalFilters from "./GlobalFilters";
import UserControl from "./UserControl";

import { Logo, Column } from "@components";

const Row = styled.div`
  display: flex;
  margin: 0 1rem;
  align-items: center;
`;

export default class ControlPanel extends Component {
  render() {
    return (
      <Row>
        <Column>
          <Logo />
        </Column>
        <GlobalFilters />
        <UserControl />
      </Row>
    );
  }
}
