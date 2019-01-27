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
import TextField from "@material-ui/core/TextField";

import { appStore } from "@stores";
import { SCATTER_PLOT, LINE_CHART, NIVO_COLOR_SCHEMES } from "@libs";
import { Selector } from "@components";

const Container = styled(Paper)`
  display: flex;
  width: 43rem;
  height: 15rem;
  margin: 1rem 0.5rem 0;
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
  /* flex: 1; */
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

const StyledTextField = styled(TextField)`
  width: 6rem;
  /* margin: 1rem; */
`;

const TextFieldsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-evenly;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: stretch;
  /* background-color: red; */
`;

/**
 * @typedef {object} Props
 * @prop {string} plotType
 *
 * @extends {Component<Props>}
 */
@observer
class DiagramSpecBlock extends Component {
  handleCheckbox = key => event => {
    appStore.configModal.diagramConfig.specConfig[key] = event.target.checked;
  };
  handleInput = key => event => {
    appStore.configModal.diagramConfig.specConfig[key] = event.target.value;
  };

  selectColors = colors => {
    appStore.configModal.diagramConfig.specConfig.colors = colors;
  };

  render() {
    let controlOptions;
    switch (this.props.plotType) {
      case SCATTER_PLOT:
        controlOptions = [
          { name: "Color Scheme", key: "colors", type: "colors" },
          { name: "Symbol Size", key: "symbolSize", type: "input" },
        ];
        break;
      case LINE_CHART:
        controlOptions = [
          { name: "Color Scheme", key: "colors", type: "colors" },
          { name: "Line Width", key: "lineWidth", type: "input" },
          { name: "Enable Area", key: "enableArea", type: "checkbox" },
          { name: "Area Opacity", key: "areaOpacity", type: "input" },
        ];
        break;
    }

    const specConfig = appStore.configModal.diagramConfig.specConfig;
    const checkboxes =
      controlOptions && controlOptions.filter(x => x.type === "checkbox");

    return (
      <Container>
        <Content>
          <Typography variant="subheading" component="h3">
            Diagram Control
          </Typography>
          <Row>
            {checkboxes && checkboxes.length > 0 && (
              <StyledFormControl component="fieldset">
                <StyledFormGroup>
                  {checkboxes.map(x => (
                    <StyledFormControlLabel
                      control={
                        <Checkbox
                          checked={specConfig && specConfig[x.key]}
                          onChange={this.handleCheckbox(x.key)}
                          value={x.key}
                        />
                      }
                      label={x.name}
                      key={x.name}
                    />
                  ))}
                </StyledFormGroup>
              </StyledFormControl>
            )}
            {controlOptions &&
              controlOptions
                .filter(x => x.type === "colors")
                .map(x => (
                  <Selector
                    name={x.name}
                    options={NIVO_COLOR_SCHEMES}
                    onSelect={this.selectColors}
                    currentSelection={specConfig.colors}
                    key={x.name}
                  />
                ))}
            <TextFieldsWrapper>
              {controlOptions &&
                controlOptions
                  .filter(x => x.type === "input")
                  .map(x => (
                    <StyledTextField
                      label={x.name}
                      value={specConfig[x.key]}
                      onChange={this.handleInput(x.key)}
                      type="number"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      margin="normal"
                      key={x.name}
                    />
                  ))}
            </TextFieldsWrapper>
          </Row>
        </Content>
      </Container>
    );
  }
}

export default DiagramSpecBlock;
