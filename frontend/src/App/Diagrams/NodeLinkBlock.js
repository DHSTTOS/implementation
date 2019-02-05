import React, { PureComponent } from 'react';
// import { observer } from 'mobx-react';

/**
 * @typedef {object} Props
 * @prop {number} width
 * @prop {number} height
 *
 * @extends {PureComponent<Props>}
 */
@observer
class NodeLinkBlock extends PureComponent {
  nodeLinkGram = React.createRef();

  componentDidMount = () => {};

  render() {
    // const { width, height } = this.props;
    return <div ref={this.nodeLinkGram} />;
  }
}

export default NodeLinkBlock;
