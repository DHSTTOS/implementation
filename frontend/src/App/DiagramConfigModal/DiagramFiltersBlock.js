import React, { Component } from "react";
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

import { appStore } from "@stores";

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
          <Row>
            <StyledFormControl component="fieldset">
              <StyledFormGroup>
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={appStore.globalFilters.layers.layer1}
                      onChange={this.handleChange("layers", "layer1")}
                      value="layer1"
                    />
                  }
                  label="Layer 1"
                />
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={appStore.globalFilters.layers.layer2}
                      onChange={this.handleChange("layers", "layer2")}
                      value="layer2"
                    />
                  }
                  label="Layer 2"
                />
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={appStore.globalFilters.layers.layer3}
                      onChange={this.handleChange("layers", "layer3")}
                      value="layer1"
                    />
                  }
                  label="Layer 3"
                />
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={appStore.globalFilters.layers.layer4}
                      onChange={this.handleChange("layers", "layer4")}
                      value="layer4"
                    />
                  }
                  label="Layer 4"
                />
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={appStore.globalFilters.layers.layer5}
                      onChange={this.handleChange("layers", "layer5")}
                      value="layer5"
                    />
                  }
                  label="Layer 5"
                />
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={appStore.globalFilters.layers.layer6}
                      onChange={this.handleChange("layers", "layer6")}
                      value="layer6"
                    />
                  }
                  label="Layer 6"
                />
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={appStore.globalFilters.layers.layer7}
                      onChange={this.handleChange("layers", "layer7")}
                      value="layer7"
                    />
                  }
                  label="Layer 7"
                />
              </StyledFormGroup>
            </StyledFormControl>
            <StyledFormControl component="fieldset">
              <StyledFormGroup>
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={appStore.globalFilters.protocols.tcp}
                      onChange={this.handleChange("protocols", "tcp")}
                      value="tcp"
                    />
                  }
                  label="TCP"
                />
                <StyledFormControlLabel
                  control={
                    <Checkbox
                      checked={appStore.globalFilters.protocols.udp}
                      onChange={this.handleChange("protocols", "udp")}
                      value="udp"
                    />
                  }
                  label="UDP"
                />
              </StyledFormGroup>
            </StyledFormControl>
          </Row>
        </Content>
      </Container>
    );
  }
}

export default DiagramFiltersBlock;
