import React, { Component } from "react";
import ReactDOM from "react-dom";
import styled from "@emotion/styled";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import OutlinedInput from "@material-ui/core/OutlinedInput";

const Container = styled.div`
  align-self: center;
`;

const StyledFormControl = styled(FormControl)`
  width: 13rem;
  margin: 1rem;
`;

export default class SourceSelector extends Component {
  state = {
    source: "",
    labelWidth: 0,
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  componentDidMount() {
    this.setState({
      labelWidth: ReactDOM.findDOMNode(this.InputLabelRef).offsetWidth,
    });
  }

  render() {
    return (
      <Container>
        <form autoComplete="off">
          <StyledFormControl variant="outlined">
            <InputLabel
              ref={ref => {
                this.InputLabelRef = ref;
              }}
            >
              Source
            </InputLabel>
            <Select
              value={this.state.source}
              onChange={this.handleChange}
              input={
                <OutlinedInput
                  labelWidth={this.state.labelWidth}
                  name="source"
                />
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="source_1">Source 1</MenuItem>
              <MenuItem value="source_2">Source 2</MenuItem>
              <MenuItem value="source_3">Source 3</MenuItem>
            </Select>
          </StyledFormControl>
        </form>
      </Container>
    );
  }
}
