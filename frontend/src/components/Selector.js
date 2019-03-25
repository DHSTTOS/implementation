import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styled from '@emotion/styled';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { observer } from 'mobx-react';

const Container = styled.div`
  align-self: center;
  margin: 0 1rem;
`;

const StyledFormControl = styled(FormControl)`
  width: ${props => props.width || '8rem'};
  margin: 1rem;
`;

/**
 * @typedef {object} Props
 * @prop {string} name
 * @prop {string[]} options
 * @prop {Function} onSelect
 * @prop {string} currentSelection
 * @prop {(string | number)} width
 *
 * @extends {Component<Props>}
 */
@observer
class Selector extends Component {
  state = {
    labelWidth: 0,
  };

  inputLabelRef = React.createRef();

  handleChange = event => {
    this.props.onSelect(event.target.value);
  };

  componentDidMount() {
    this.setState({
      labelWidth: ReactDOM.findDOMNode(this.inputLabelRef.current).offsetWidth,
    });
  }

  render() {
    return (
      <Container>
        <form autoComplete="off">
          <StyledFormControl variant="outlined" width={this.props.width}>
            <InputLabel ref={this.inputLabelRef}>{this.props.name}</InputLabel>
            <Select
              value={this.props.currentSelection}
              onChange={this.handleChange}
              input={
                <OutlinedInput
                  labelWidth={this.state.labelWidth}
                  name={this.props.name}
                />
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {this.props.options &&
                this.props.options.map(x => (
                  <MenuItem value={x} key={this.props.name + x}>
                    {x}
                  </MenuItem>
                ))}
            </Select>
          </StyledFormControl>
        </form>
      </Container>
    );
  }
}

export default Selector;
