import React, { Component } from 'react';
import { observer } from 'mobx-react';

/**
 * @typedef {object} Props
 * @prop {number} id the number part from "Ether.769"
 * @prop {object[]} data the data.serie.data thing
 *
 * @extends {Component<Props>}
 */
@observer
class Tooltip extends Component {
  render() {
    return <div>{''}</div>;
  }
}

export default Tooltip;
