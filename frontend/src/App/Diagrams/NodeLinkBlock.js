import React, { PureComponent } from 'react';
// import { observer } from 'mobx-react';

/**
 * @typedef {object} Props
 * @prop {number} width
 * @prop {number} height
 * @prop {object[]} data
 * @prop {string} x
 * @prop {string} y
 * @prop {string} colors
 * @prop {number} symbolSize
 *
 * @extends {PureComponent<Props>}
 */
@observer
class NodeLinkBlock extends PureComponent {
  nodeLinkGram = React.createRef();

  componentDidMount = () => {};

  render() {
    // const { width, height, data, x, y, colors, symbolSize } = this.props;
    return <div ref={this.nodeLinkGram} />;
  }
}

export default NodeLinkBlock;
