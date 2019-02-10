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
    const network = Network();
    console.log(this.nodeLinkGram.current);
    network(this.nodeLinkGram.current, { nodes: [], links: [] });
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

class RadialPlacement {
  // stores the key -> location values
  values = d3.map();
  // how much to separate each location by
  increment = 5;
  // how large to make the layout
  radius = 100;
  // where the center of the layout should be
  center = { x: 0, y: 0 };
  // what angle to start at
  start = -120;
  current = this_start;

  // Given an center point, angle, and radius length,
  // return a radial position for that angle
  radialLocation = function(center, angle, radius) {
    const x = center.x + radius * Math.cos((angle * Math.PI) / 180);
    const y = center.y + radius * Math.sin((angle * Math.PI) / 180);
    return { x: x, y: y };
  };

  // Main entry point for RadialPlacement
  // Returns location for a particular key,
  // creating a new location if necessary.
  placement = function(key) {
    let value = this_values.get(key);
    if (!this_values.has(key)) {
      value = this_place(key);
    }
    return value;
  };

  // Gets a new location for input key
  place = function(key) {
    const value = this_radialLocation(this_center, this_current, this_radius);
    this_values.set(key, value);
    this_current += this_increment;
    return value;
  };

  // Given a set of keys, perform some
  // magic to create a two ringed radial layout.
  // Expects radius, increment, and center to be set.
  // If there are a small number of keys, just make
  // one circle.
  setKeys = keys => {
    // start with an empty values
    this_values = d3.map();

    // keys.forEach(k => console.log(k));

    this_increment = 25;

    // Fullscreen size
    keys.forEach(k => {
      if (k.includes(':')) {
        this_radius = 100;
        this_place(k);
      } else if (k.includes('.')) {
        this_radius = 300;
        this_place(k);
      } else {
        this_radius = 600;
        this_place(k);
      }
    });
  };

  this_placement.keys = function(_) {
    if (!arguments.length) {
      return d3.keys(this_values);
    }
    this_setKeys(_);
    return this_placement;
  };

  this_placement.center = function(_) {
    if (!arguments.length) {
      return this_center;
    }
    this_center = _;
    return this_placement;
  };

  this_placement.radius = function(_) {
    if (!arguments.length) {
      return this_radius;
    }
    this_radius = _;
    return this_placement;
  };

  this_placement.start = function(_) {
    if (!arguments.length) {
      return this_start;
    }
    this_start = _;
    this_current = this_start;
    return this_placement;
  };

  this_placement.increment = function(_) {
    if (!arguments.length) {
      return this_increment;
    }
    this_increment = _;
    return this_placement;
  };

  // return this_placement;
}

class Network {
  // variables we want to access
  // in multiple places of Network
  this_width = 1260;
  height = 1260;

  // allData will store the unfiltered data
  this_allData = [];
  this_curLinksData = [];
  this_curNodesData = [];
  this_linkedByIndex = {};

  // these will hold the svg groups for
  // accessing the nodes and links display
  this_nodesG = null;
  this_linksG = null;
  // these will point to the circles and lines
  // of the nodes and links
  this_node = null;
  this_link = null;

  // variables to refect the current settings
  // of the visualization
  this_sort = 'data';
  // groupCenters will store our radial layout for
  // the group by id layout.
  this_groupCenters = null;

  // our force directed layout
  this_force = d3.layout.force();
  // color function used to color nodes
  // const nodeColors = d3.scale.category20();
  // tooltip used to display details
  this_tooltip = Tooltip('vis-tooltip', 230);

  // // charge used in id layout
  // const charge = node => -Math.pow(node.radius, 2.0) / 2;

  // Starting point for network visualization
  // Initializes visualization and starts force layout
  this_network = function(selection, data) {
    // format our data
    this_allData = this_setupData(data);
    //network.setOptions(options);
    // create our svg and groups
    const vis = d3
      .select(selection)
      .append('svg')
      .attr('width', this_width)
      .attr('height', height);
    this_linksG = vis.append('g').attr('id', 'links');
    this_nodesG = vis.append('g').attr('id', 'nodes');

    // setup the size of the force environment
    this_force.size([this_width, height]);

    this_force.on('tick', this_radialTick);
    // .charge(charge);
    // setFilter('all');

    // perform rendering and start force layout
    this_update();
  };

  // The update() function performs the bulk of the
  // work to setup our visualization based on the
  // current layout/sort/filter.
  //
  // update() is called everytime a parameter changes
  // and the network needs to be reset.
  this_update = function() {
    // filter data to show based on current filter settings.
    this_curNodesData = this_filterNodes(this_allData.nodes);
    // console.log(allData.node);
    this_curLinksData = this_filterLinks(this_allData.links, this_curNodesData);

    // sort nodes based on current sort and update centers for
    // radial layout

    const id = this_sortedId(this_curNodesData, this_curLinksData);
    this_updateCenters(id);

    // reset nodes in force layout
    this_force.nodes(this_curNodesData);

    // enter / exit for nodes
    this_updateNodes();

    // reset links so they do not interfere with
    // other layouts. updateLinks() will be called when
    // force is done animating.
    this_force.links([]);
    // if present, remove them from svg
    if (this_link) {
      // console.log(link)
      this_link
        .data([])
        .exit()
        .remove();
      this_link = null;
    }
    // }

    // start me up!
    this_force.start();
  };

  this_network.updateData = function(newData) {
    this_allData = this_setupData(newData);
    this_link && this_link.remove();
    this_node && this_node.remove();
    this_update();
  };

  // network.setOptions(options);
  // called once to clean up raw data and switch links to
  // point to node instances
  // Returns modified data
  this_setupData = function(data) {
    // initialize circle radius scale
    const countExtent = d3.extent(data.nodes, d => 12);
    const circleRadius = d3.scale
      .sqrt()
      .range([3, 12])
      .domain(countExtent);

    data.nodes.forEach(function(n) {
      // set initial x/y to values within the width/height
      // of the visualization

      // add radius to the node so we can use it later
      n.radius = circleRadius(12);
    });

    // id's -> node objects
    const nodesMap = this_mapNodes(data.nodes);

    // switch links to point to node objects instead of id's
    data.links.forEach(function(l) {
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
      this_linkedByIndex[l.source.id + ',' + l.target.id] = 1;
    });

    return data;
  };

  // Helper function to map node id's to node objects.
  // Returns d3.map of ids -> nodes
  this_mapNodes = function(nodes) {
    const l2Map = d3.map();

    nodes.forEach(n => {
      l2Map.set(n.id, n);
    });

    return l2Map;
  };

  // Helper function that returns an associative array
  // with counts of unique attr in nodes
  // attr is value stored in node, like 'id'
  this_nodeCounts = function(nodes, attr) {
    const counts = {};
    nodes.forEach(function(d) {
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
  this_neighboring(a, b) {
    this_linkedByIndex[a.id + ',' + b.id] || this_linkedByIndex[b.id + ',' + a.id];
  }
  // Removes nodes from input array
  // based on current filter setting.
  // Returns array of nodes
  this_filterNodes = function(allNodes) {
    let filteredNodes = allNodes;
    return filteredNodes;
  };

  // Returns array of id sorted based on
  // current sorting method.
  this_sortedId = function(nodes, links) {
    let counts;
    let id = [];
    if (this_sort === 'links') {
      counts = {};
      links.forEach(function(l) {
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
      counts = this_nodeCounts(nodes, 'id');
      id = d3.entries(counts).sort((a, b) => b.value - a.value);
      id = id.map(v => v.key);
    }

    return id;
  };

  this_updateCenters = function(id) {
    this_groupCenters = RadialPlacement()
      .center({ x: this_width / 2, y: height / 2 - 100 })
      .radius(300)
      //.increment(18)
      .keys(id);
  };

  // Removes links from allLinks whose
  // source or target is not present in curNodes
  // Returns array of links
  this_filterLinks = function(allLinks, curNodes) {
    curNodes = this_mapNodes(curNodes);
    return allLinks.filter(
      l => curNodes.get(l.source.id) && curNodes.get(l.target.id)
    );
  };

  // enter/exit display for nodes
  this_updateNodes = function() {
    this_node = this_nodesG.selectAll('circle.node').data(this_curNodesData, d => d.id);

    this_node
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius)
      // .style('fill', d => nodeColors(d.id))
      .style('fill', function(d) {
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
      .style('stroke', d => this_strokeFor(d))
      .style('stroke-width', 1.0);

    this_node
      .on('mouseover', (d, i) => {
        this_showDetails(d, i);
      })
      .on('mouseout', this_hideDetails);

    return this_node.exit().remove();
  };

  // enter/exit display for links
  this_updateLinks = function() {
    this_link = this_linksG
      .selectAll('line.link')
      .data(this_curLinksData, d => `${d.source.id}_${d.target.id}`);
    this_link
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#ddd')
      .attr('stroke-opacity', 0.8)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    this_link.on('mouseover', this_showLinkDetails).on('mouseout', this_hideLinkDetails);

    return this_link.exit().remove();
  };

  this_fade(opacity) {
    return function(d) {
      this_node.style('stroke-opacity', function(o) {
        const thisOpacity = this_neighboring(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });

      this_link.style('stroke-opacity', function(o) {
        return o.source === d || o.target === d ? 1 : opacity;
      });
    };
  }

  // tick function for radial layout
  this_radialTick = function(e) {
    this_node.each(this_moveToRadialLayout(e.alpha));

    this_node.attr('cx', d => d.x).attr('cy', d => d.y);

    if (e.alpha < 0.03) {
      this_updateLinks();
      this_force.stop();
    }
  };

  // Adjusts x/y for each node to
  // push them towards appropriate location.
  // Uses alpha to dampen effect over time.
  this_moveToRadialLayout = function(alpha) {
    const k = alpha * 0.1;
    return function(d) {
      const centerNode = this_groupCenters(d.id);
      d.x += (centerNode.x - d.x) * k;
      return (d.y += (centerNode.y - d.y) * k);
    };
  };

  // Helper function that returns stroke color for
  // particular node.
  this_strokeFor = d =>
    d3
      .rgb(24, 255, 139) //(nodeColors(d.id))
      .darker()
      .toString();

  // Mouseover tooltip function
  this_showDetails = function(d, i) {
    let content = `<p class="main">id:  ${d.id}</span></p>`;
    content += '<hr class="tooltip-hr">';
    content += `<p class="main">Protocol:  ${d.Protocol}</span></p>`;
    this_tooltip.showTooltip(content, d3.event);

    // highlight connected links
    if (this_link) {
      this_link
        .attr('stroke', function(l) {
          if (l.source === d || l.target === d) {
            return '#007243';
          } else {
            return this_fade(0.1);
            // return "#ddd";
          }
        })
        .attr('stroke-opacity', function(l) {
          if (l.source === d || l.target === d) {
            return 10.0;
          } else {
            return 0.5;
          }
        });
    }

    // highlight neighboring nodes
    // watch out - don't mess with node if search is currently matching
    this_node
      .style('stroke', function(n) {
        if (this_neighboring(d, n)) {
          return '#007243';
        } else {
          return this_strokeFor(n);
        }
      })
      .style('stroke-width', function(n) {
        if (this_neighboring(d, n)) {
          return 2.0;
        } else {
          return this_fade(0.2);
        }
      });

    // highlight the node being moused over
    return d3
      .select(this)
      .style('stroke', 'black')
      .style('stroke-width', 5.0);
  };

  this_showLinkDetails = function(d, i) {
    let content = `<p class="main">Source: ${d.source.id}</span></p>
    <hr class="tooltip-hr">
    <p class="main">Target:  ${d.target.id}</span></p>`;
    // console.log(d.source.id);
    this_tooltip.showTooltip(content, d3.event);
  };

  this_hideLinkDetails = function(d, i) {
    this_tooltip.hideTooltip();
  };
  // Mouseout function
  this_hideDetails = function(d, i) {
    this_tooltip.hideTooltip();
    // watch out - don't mess with node if search is currently matching
    this_node
      .style('stroke', function(n) {
        if (!n.searched) {
          return this_strokeFor(n);
        } else {
          return '#555';
        }
      })
      .style('stroke-width', function(n) {
        if (!n.searched) {
          return 1.0;
        } else {
          return 2.0;
        }
      });
    if (this_link) {
      return this_link.attr('stroke', '#ddd').attr('stroke-opacity', 0.8);
    }
  };

  // Final act of Network() function is to return the inner 'network()' function.
  // return this_network;
}

export default NodeLinkBlock;
