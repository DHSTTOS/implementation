import React, { PureComponent } from 'react';
import { autorun } from 'mobx';
import { dataStore } from '@stores';
import styled from '@emotion/styled';

const LegendContainer = styled.div`
  position: absolute;
  z-index: 10000;
  list-style: none;
  top: 6rem;
  /* background-color: red; */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Row = styled.div`
  display: flex;
`;

const LegendBox = styled.div`
  width: 2rem;
  height: 1rem;
  background-color: ${props => props.color};
  margin: 1px 5px;
  border: 1px solid #ddd;
`;

class NodeLinkBlock extends PureComponent {
  nodeLinkGram = React.createRef();
  disposeAutorun = () => {};

  componentDidMount = () => {
    const network = new Network(this.nodeLinkGram.current, {
      nodes: [],
      links: [],
    });
    console.log(this.nodeLinkGram.current);

    // network.updateData
    console.warn('First step done');

    this.disposeAutorun = autorun(_ => {
      console.warn('In');
      network.updateData(dataStore.currentNodeLinkData);
      console.warn('Out');
    });
    console.warn('Last step done');
  };

  componentWillUnmount = () => {
    this.disposeAutorun();
    // this.nodeLinkGram.current.remove();
    this.nodeLinkGram.current.remove();
    console.warn('Removed dom node');
    document.getElementById('vis-tooltip').remove();
  };

  render() {
    return (
      <div>
        <div ref={this.nodeLinkGram} />
        <LegendContainer>
          <Row>
            <LegendBox color="rgb(12, 67, 199)" /> MAC Address
          </Row>
          <Row>
            <LegendBox color="rgb(255, 224, 25)" /> IP Address
          </Row>
          <Row>
            <LegendBox color="rgb(255, 24, 166)" /> UDP
          </Row>
          <Row>
            <LegendBox color="rgb(24, 255, 177)" /> TCP
          </Row>
        </LegendContainer>
      </div>
    );
  }
}

// Be extra cautious making changes to the code below.

function RadialPlacement() {
  // stores the key -> location values
  let values = d3.map();
  // how much to separate each location by
  let increment = 5;
  // how large to make the layout
  let radius = 100;
  // where the center of the layout should be
  let center = { x: 0, y: 0 };
  // what angle to start at
  let start = -120;
  let current = start;

  // Given an center point, angle, and radius length,
  // return a radial position for that angle
  const radialLocation = function(center, angle, radius) {
    const x = center.x + radius * Math.cos((angle * Math.PI) / 180);
    const y = center.y + radius * Math.sin((angle * Math.PI) / 180);
    return { x: x, y: y };
  };

  // Main entry point for RadialPlacement
  // Returns location for a particular key,
  // creating a new location if necessary.
  const placement = function(key) {
    let value = values.get(key);
    if (!values.has(key)) {
      value = place(key);
    }
    return value;
  };

  // Gets a new location for input key
  var place = function(key) {
    const value = radialLocation(center, current, radius);
    values.set(key, value);
    current += increment;
    return value;
  };

  // Given a set of keys, perform some
  // magic to create a two ringed radial layout.
  // Expects radius, increment, and center to be set.
  // If there are a small number of keys, just make
  // one circle.
  const setKeys = keys => {
    // start with an empty values
    values = d3.map();

    // keys.forEach(k => console.log(k));

    increment = 25;

    // Fullscreen size
    keys.forEach(k => {
      if (k.includes(':')) {
        radius = 100;
        place(k);
      } else if (k.includes('.')) {
        radius = 300;
        place(k);
      } else {
        radius = 600;
        place(k);
      }
    });
  };

  placement.keys = function(_) {
    if (!arguments.length) {
      return d3.keys(values);
    }
    setKeys(_);
    return placement;
  };

  placement.center = function(_) {
    if (!arguments.length) {
      return center;
    }
    center = _;
    return placement;
  };

  placement.radius = function(_) {
    if (!arguments.length) {
      return radius;
    }
    radius = _;
    return placement;
  };

  placement.start = function(_) {
    if (!arguments.length) {
      return start;
    }
    start = _;
    current = start;
    return placement;
  };

  placement.increment = function(_) {
    if (!arguments.length) {
      return increment;
    }
    increment = _;
    return placement;
  };

  return placement;
}

class Network {
  // variables we want to access
  // in multiple places of Network
  width = 1260;
  height = 1260;

  // allData will store the unfiltered data
  allData = [];
  curLinksData = [];
  curNodesData = [];
  linkedByIndex = {};

  // these will hold the svg groups for
  // accessing the nodes and links display
  nodesG = null;
  linksG = null;
  // these will point to the circles and lines
  // of the nodes and links
  node = null;
  link = null;

  // variables to refect the current settings
  // of the visualization
  sort = 'data';
  // groupCenters will store our radial layout for
  // the group by id layout.
  groupCenters = null;

  // our force directed layout
  force = d3.layout.force();
  // color function used to color nodes
  // const nodeColors = d3.scale.category20();
  // tooltip used to display details
  tooltip = Tooltip('vis-tooltip', 230);

  // // charge used in id layout
  // const charge = node => -Math.pow(node.radius, 2.0) / 2;

  constructor(domNode, data) {
    // Starting point for network visualization
    // Initializes visualization and starts force layout

    // format our data
    this.allData = this.setupData(data);
    //network.setOptions(options);
    // create our svg and groups
    const vis = d3
      .select(domNode)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
    this.linksG = vis.append('g').attr('id', 'links');
    this.nodesG = vis.append('g').attr('id', 'nodes');

    // setup the size of the force environment
    this.force.size([this.width, this.height]);

    this.force.on('tick', this.radialTick);
    // .charge(charge);
    // setFilter('all');

    // perform rendering and start force layout
    this.update();
  }

  updateData = newData => {
    this.allData = this.setupData(newData);
    this.link && this.link.remove();
    this.node && this.node.remove();
    this.update();
  };

  // The update() function performs the bulk of the
  // work to setup our visualization based on the
  // current layout/sort/filter.
  //
  // update() is called everytime a parameter changes
  // and the network needs to be reset.
  update = () => {
    // filter data to show based on current filter settings.
    this.curNodesData = this.filterNodes(this.allData.nodes);
    // console.log(allData.node);
    this.curLinksData = this.filterLinks(this.allData.links, this.curNodesData);

    // sort nodes based on current sort and update centers for
    // radial layout

    const id = this.sortedId(this.curNodesData, this.curLinksData);
    this.updateCenters(id);

    // reset nodes in force layout
    this.force.nodes(this.curNodesData);

    // enter / exit for nodes
    this.updateNodes();

    // reset links so they do not interfere with
    // other layouts. updateLinks() will be called when
    // force is done animating.
    this.force.links([]);
    // if present, remove them from svg
    if (this.link) {
      // console.log(link)
      this.link
        .data([])
        .exit()
        .remove();
      this.link = null;
    }
    // }

    // start me up!
    this.force.start();
  };

  // network.setOptions(options);
  // called once to clean up raw data and switch links to
  // point to node instances
  // Returns modified data
  setupData = data => {
    // initialize circle radius scale
    const countExtent = d3.extent(data.nodes, d => 12);
    const circleRadius = d3.scale
      .sqrt()
      .range([3, 12])
      .domain(countExtent);

    data.nodes.forEach(n => {
      // set initial x/y to values within the width/height
      // of the visualization

      // add radius to the node so we can use it later
      n.radius = circleRadius(12);
    });

    // id's -> node objects
    const nodesMap = this.mapNodes(data.nodes);

    // switch links to point to node objects instead of id's
    data.links.forEach(l => {
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
      this.linkedByIndex[l.source.id + ',' + l.target.id] = 1;
    });

    return data;
  };

  // Helper function to map node id's to node objects.
  // Returns d3.map of ids -> nodes
  mapNodes = nodes => {
    const l2Map = d3.map();

    nodes.forEach(n => {
      l2Map.set(n.id, n);
    });

    return l2Map;
  };

  // Helper function that returns an associative array
  // with counts of unique attr in nodes
  // attr is value stored in node, like 'id'
  nodeCounts = (nodes, attr) => {
    const counts = {};
    nodes.forEach(d => {
      if (counts[d[attr]] == null) {
        counts[d[attr]] = 0;
      }
      return (counts[d[attr]] += 1);
    });
    return counts;
  };

  // Given two nodes a and b, returns true if
  // there is a link between them.
  // Uses linkedByIndex initialized in setupData
  neighboring(a, b) {
    this.linkedByIndex[a.id + ',' + b.id] ||
      this.linkedByIndex[b.id + ',' + a.id];
  }
  // Removes nodes from input array
  // based on current filter setting.
  // Returns array of nodes
  filterNodes = allNodes => {
    let filteredNodes = allNodes;
    return filteredNodes;
  };

  // Returns array of id sorted based on
  // current sorting method.
  sortedId = (nodes, links) => {
    let counts;
    let id = [];
    if (this.sort === 'links') {
      counts = {};
      links.forEach(l => {
        if (counts[l.source.id] == null) {
          counts[l.source.id] = 0;
        }
        counts[l.source.id] += 1;
        if (counts[l.target.id] == null) {
          counts[l.target.id] = 0;
        }
        return (counts[l.target.id] += 1);
      });
      // add any missing id that dont have any links
      nodes.forEach(n =>
        counts[n.id] != null ? counts[n.id] : (counts[n.id] = 0)
      );

      // sort based on counts
      id = d3.entries(counts).sort((a, b) => b.value - a.value);
      // get just names
      id = id.map(v => v.key);
    } else {
      // sort id by song count
      counts = this.nodeCounts(nodes, 'id');
      id = d3.entries(counts).sort((a, b) => b.value - a.value);
      id = id.map(v => v.key);
    }

    return id;
  };

  updateCenters = id => {
    this.groupCenters = RadialPlacement()
      .center({ x: this.width / 2, y: this.height / 2 - 100 })
      .radius(300)
      //.increment(18)
      .keys(id);
  };

  // Removes links from allLinks whose
  // source or target is not present in curNodes
  // Returns array of links
  filterLinks = (allLinks, curNodes) => {
    curNodes = this.mapNodes(curNodes);
    return allLinks.filter(
      l => curNodes.get(l.source.id) && curNodes.get(l.target.id)
    );
  };

  // enter/exit display for nodes
  updateNodes = () => {
    this.node = this.nodesG
      .selectAll('circle.node')
      .data(this.curNodesData, d => d.id);

    this.node
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius)
      // .style('fill', d => nodeColors(d.id))
      .style('fill', d => {
        if (d.Protocol == 'IP') {
          return d3.rgb(12, 67, 199);
        } else if (d.Protocol == 'Ether') {
          return d3.rgb(255, 224, 25);
        } else if (d.Protocol == 'UDP') {
          return d3.rgb(255, 24, 166);
        } else {
          return d3.rgb(24, 255, 177);
        }
      })
      .style('stroke', d => this.strokeFor(d))
      .style('stroke-width', 1.0);

    this.node
      .on('mouseover', (d, i) => {
        this.showDetails(d, i);
      })
      .on('mouseout', this.hideDetails);

    return this.node.exit().remove();
  };

  // enter/exit display for links
  updateLinks = () => {
    this.link = this.linksG
      .selectAll('line.link')
      .data(this.curLinksData, d => `${d.source.id}_${d.target.id}`);
    this.link
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#ddd')
      .attr('stroke-opacity', 0.8)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    this.link
      .on('mouseover', this.showLinkDetails)
      .on('mouseout', this.hideLinkDetails);

    return this.link.exit().remove();
  };

  fade = opacity => {
    return d => {
      this.node.style('stroke-opacity', o => {
        const thisOpacity = this.neighboring(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });

      this.link.style('stroke-opacity', o => {
        return o.source === d || o.target === d ? 1 : opacity;
      });
    };
  };

  // tick function for radial layout
  radialTick = e => {
    this.node.each(this.moveToRadialLayout(e.alpha));

    this.node.attr('cx', d => d.x).attr('cy', d => d.y);

    if (e.alpha < 0.03) {
      this.updateLinks();
      this.force.stop();
    }
  };

  // Adjusts x/y for each node to
  // push them towards appropriate location.
  // Uses alpha to dampen effect over time.
  moveToRadialLayout = alpha => {
    const k = alpha * 0.1;
    return d => {
      const centerNode = this.groupCenters(d.id);
      d.x += (centerNode.x - d.x) * k;
      return (d.y += (centerNode.y - d.y) * k);
    };
  };

  // Helper function that returns stroke color for
  // particular node.
  strokeFor = d =>
    d3
      .rgb(24, 255, 139) //(nodeColors(d.id))
      .darker()
      .toString();

  // Mouseover tooltip function
  showDetails = (d, i) => {
    let content = `<p class="main">id:  ${d.id}</span></p>`;
    content += '<hr class="tooltip-hr">';
    content += `<p class="main">Protocol:  ${d.Protocol}</span></p>`;
    this.tooltip.showTooltip(content, d3.event);

    // highlight connected links
    if (this.link) {
      this.link
        .attr('stroke', l => {
          if (l.source === d || l.target === d) {
            return '#007243';
          } else {
            return this.fade(0.1);
            // return "#ddd";
          }
        })
        .attr('stroke-opacity', l => {
          if (l.source === d || l.target === d) {
            return 10.0;
          } else {
            return 0.5;
          }
        });
    }

    // highlight neighboring nodes
    // watch out - don't mess with node if search is currently matching
    this.node
      .style('stroke', n => {
        if (this.neighboring(d, n)) {
          return '#007243';
        } else {
          return this.strokeFor(n);
        }
      })
      .style('stroke-width', n => {
        if (this.neighboring(d, n)) {
          return 2.0;
        } else {
          return this.fade(0.2);
        }
      });

    // highlight the node being moused over
    return d3
      .select(this)
      .style('stroke', 'black')
      .style('stroke-width', 5.0);
  };

  showLinkDetails = (d, i) => {
    let content = `<p class="main">Source: ${d.source.id}</span></p>
    <hr class="tooltip-hr">
    <p class="main">Target:  ${d.target.id}</span></p>`;
    // console.log(d.source.id);
    this.tooltip.showTooltip(content, d3.event);
  };

  hideLinkDetails = (d, i) => {
    this.tooltip.hideTooltip();
  };
  // Mouseout function
  hideDetails = (d, i) => {
    this.tooltip.hideTooltip();
    // watch out - don't mess with node if search is currently matching
    this.node
      .style('stroke', n => {
        if (!n.searched) {
          return this.strokeFor(n);
        } else {
          return '#555';
        }
      })
      .style('stroke-width', n => {
        if (!n.searched) {
          return 1.0;
        } else {
          return 2.0;
        }
      });
    if (this.link) {
      return this.link.attr('stroke', '#ddd').attr('stroke-opacity', 0.8);
    }
  };

  // Final act of Network() function is to return the inner 'network()' function.
  // return this.network;
}

export default NodeLinkBlock;
