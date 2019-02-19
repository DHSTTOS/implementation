import React, { PureComponent } from 'react';
import { autorun, toJS } from 'mobx';
import { dataStore } from '@stores';
import styled from '@emotion/styled';

const LegendContainer = styled.div`
  position: absolute;
  z-index: 10000;
  list-style: none;
  top: 6rem;
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
    network(this.nodeLinkGram.current, {
      nodes: [],
      links: [],
    });

    this.disposeAutorun = autorun(_ => {
      network.updateData(
        JSON.parse(JSON.stringify(toJS(dataStore.currentNodeLinkData)))
      );
    });
  };

  componentWillUnmount = () => {
    this.disposeAutorun();
    this.nodeLinkGram.current.remove();
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

//
// ** WARNING **
//
// I have tried to refactor this stuff into modern ES6 class syntax and to make things nice
// and immutable 3 times already, and have failed every single time.
//
// Mutable variable land mines everywhere, there's also no such thing called scope down there.
//
// Total time spent to refactor/debug/modernize this code - about 22 hours on my side alone.
//
// Long live all those TC39 folks who made JS usable again. My utmost respect to all JS
// developers who worked with the pre-ES6 version of JS.
//
// It would be more efficient to rewrite the viz TBH but our team don't have enough time/energy
// to do that.
//
// Proceed with great caution please.
//

function RadialPlacement() {
  // stores the key -> location values
  let values = d3.map();
  // how much to separate each location by
  let increment = 5;
  // how large to make the layout
  let radius = 100;
  //starting x-radius of the ellipse
  let radiusA = 200;
  //starting y-radius of the ellipse
  let radiusB = 150;
  // where the center of the layout should be
  let center = { x: 0, y: 0 };
  // what angle to start at
  let start = -120;
  let current = start;

  // Given an center point, angle, and x-radius length and y-radius length,
  // return a radial position for that angle
  const radialLocation = function(center, angle, radiusA, radiusB) {
    const x = center.x + radiusA * Math.cos((angle * Math.PI) / 180);
    const y = center.y + radiusB * Math.sin((angle * Math.PI) / 180);
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
    const value = radialLocation(center, current, radiusA,radiusB);
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

    increment = 25;

    // Fullscreen size
    keys.forEach(k => {
      if (k.includes(':')) {
        //set the radius for the first layer
        radiusA = 200;
        radiusB = 150;
        place(k);
      } else if (k.includes('.')) {
        //set the radius for the second layer
        radiusA = 400;
        radiusB = 280;
        place(k);
      } else {
        //set the radius for the third layer
        radiusA = 600;
        radiusB = 400;
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

function Network() {
  // variables we want to access
  // in multiple places of Network
  const width = 1260;
  const height = 1260;

  // allData will store the unfiltered data
  let allData = [];
  let curLinksData = [];
  let curNodesData = [];
  const linkedByIndex = {};

  // these will hold the svg groups for
  // accessing the nodes and links display
  let nodesG = null;
  let linksG = null;
  // these will point to the circles and lines
  // of the nodes and links
  let node = null;
  let link = null;

  // variables to refect the current settings
  // of the visualization
  let sort = 'data';
  // groupCenters will store our radial layout for
  // the group by id layout.
  let groupCenters = null;

  // our force directed layout
  const force = d3.layout.force();
  // color function used to color nodes
  // const nodeColors = d3.scale.category20();
  // tooltip used to display details
  const tooltip = Tooltip('vis-tooltip', 230);

  // // charge used in id layout
  // const charge = node => -Math.pow(node.radius, 2.0) / 2;

  // Starting point for network visualization
  // Initializes visualization and starts force layout
  const network = function(selection, data) {
    // format our data
    allData = setupData(data);
    //network.setOptions(options);
    // create our svg and groups
    const vis = d3
      .select(selection)
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    linksG = vis.append('g').attr('id', 'links');
    nodesG = vis.append('g').attr('id', 'nodes');

    // setup the size of the force environment
    force.size([width, height]);

    force.on('tick', radialTick);
    // .charge(charge);
    // setFilter('all');

    // perform rendering and start force layout
    update();
  };

  // The update() function performs the bulk of the
  // work to setup our visualization based on the
  // current layout/sort/filter.
  //
  // update() is called everytime a parameter changes
  // and the network needs to be reset.
  var update = function() {
    // filter data to show based on current filter settings.
    curNodesData = filterNodes(allData.nodes);
    curLinksData = filterLinks(allData.links, curNodesData);

    // sort nodes based on current sort and update centers for
    // radial layout

    const id = sortedId(curNodesData, curLinksData);
    updateCenters(id);

    // reset nodes in force layout
    force.nodes(curNodesData);

    // enter / exit for nodes
    updateNodes();

    // reset links so they do not interfere with
    // other layouts. updateLinks() will be called when
    // force is done animating.
    force.links([]);
    // if present, remove them from svg
    if (link) {
      link
        .data([])
        .exit()
        .remove();
      link = null;
    }

    // start me up!
    force.start();
  };

  network.updateData = function(newData) {
    allData = setupData(newData);
    link && link.remove();
    node && node.remove();
    update();
  };

  // network.setOptions(options);
  // called once to clean up raw data and switch links to
  // point to node instances
  // Returns modified data
  var setupData = function(data) {
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
    const nodesMap = mapNodes(data.nodes);

    // switch links to point to node objects instead of id's
    data.links.forEach(function(l) {
      l.source = nodesMap.get(l.source);
      l.target = nodesMap.get(l.target);
      linkedByIndex[l.source.id + ',' + l.target.id] = 1;
    });

    return data;
  };

  // Helper function to map node id's to node objects.
  // Returns d3.map of ids -> nodes
  var mapNodes = function(nodes) {
    const l2Map = d3.map();

    nodes.forEach(n => {
      l2Map.set(n.id, n);
    });

    return l2Map;
  };

  // Helper function that returns an associative array
  // with counts of unique attr in nodes
  // attr is value stored in node, like 'id'
  const nodeCounts = function(nodes, attr) {
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
  function neighboring(a, b) {
    linkedByIndex[a.id + ',' + b.id] || linkedByIndex[b.id + ',' + a.id];
  }
  // Removes nodes from input array
  // based on current filter setting.
  // Returns array of nodes
  var filterNodes = function(allNodes) {
    let filteredNodes = allNodes;
    return filteredNodes;
  };

  // Returns array of id sorted based on
  // current sorting method.
  var sortedId = function(nodes, links) {
    let counts;
    let id = [];
    if (sort === 'links') {
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
      counts = nodeCounts(nodes, 'id');
      id = d3.entries(counts).sort((a, b) => b.value - a.value);
      id = id.map(v => v.key);
    }

    return id;
  };

  var updateCenters = function(id) {
    groupCenters = RadialPlacement()
      .center({ x: width / 2, y: height / 2 - 100 })
      .radius(300)
      //.increment(18)
      .keys(id);
  };

  // Removes links from allLinks whose
  // source or target is not present in curNodes
  // Returns array of links
  var filterLinks = function(allLinks, curNodes) {
    curNodes = mapNodes(curNodes);
    return allLinks.filter(
      l => curNodes.get(l.source.id) && curNodes.get(l.target.id)
    );
  };

  // enter/exit display for nodes
  var updateNodes = function() {
    node = nodesG.selectAll('ellipse.node').data(curNodesData, d => d.id);

    node
      .enter()
      .append('ellipse')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('rx', d => d.radius)
      .attr('ry', d => d.radius)
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
      .style('stroke', d => strokeFor(d))
      .style('stroke-width', 1.0);

    node
      .on('mouseover', (d, i) => {
        showDetails(d, i);
      })
      .on('mouseout', hideDetails)
      .on("click",function(d,l){
        alert("The id of the clicked node is : " +" "+ d.id  +
        "\nItstype is: " +" " +d.type +  
        "\nIts Protocol is : " +" "+d.Protocol);});
     

    return node.exit().remove();
  };

  


  // enter/exit display for links
  var updateLinks = function() {
    link = linksG
      .selectAll('line.link')
      .data(curLinksData, d => `${d.source.id}_${d.target.id}`);
    link
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('stroke', '#ddd')
      .attr('stroke-opacity', 0.8)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    link.on('mouseover', showLinkDetails).on('mouseout', hideLinkDetails);

    return link.exit().remove();
  };

  function fade(opacity) {
    return function(d) {
      node.style('stroke-opacity', function(o) {
        const thisOpacity = neighboring(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });

      link.style('stroke-opacity', function(o) {
        return o.source === d || o.target === d ? 1 : opacity;
      });
    };
  }

  // tick function for radial layout
  var radialTick = function(e) {
    node.each(moveToRadialLayout(e.alpha));

    node.attr('cx', d => d.x).attr('cy', d => d.y);

    if (e.alpha < 0.03) {
      updateLinks();
      force.stop();
    }
  };

  // Adjusts x/y for each node to
  // push them towards appropriate location.
  // Uses alpha to dampen effect over time.
  var moveToRadialLayout = function(alpha) {
    const k = alpha * 0.1;
    return function(d) {
      const centerNode = groupCenters(d.id);
      d.x += (centerNode.x - d.x) * k;
      return (d.y += (centerNode.y - d.y) * k);
    };
  };

  // Helper function that returns stroke color for
  // particular node.
  var strokeFor = d =>
    d3
      .rgb(24, 255, 139) //(nodeColors(d.id))
      .darker()
      .toString();

  // Mouseover tooltip function
  var showDetails = function(d, i) {
    let content = `<p class="main">id:  ${d.id}</span></p>`;
    content += '<hr class="tooltip-hr">';
    content += `<p class="main">Protocol:  ${d.Protocol}</span></p>`;
    tooltip.showTooltip(content, d3.event);

    // highlight connected links
    if (link) {
      link
        .attr('stroke', function(l) {
          if (l.source === d || l.target === d) {
            return '#007243';
          } else {
            return fade(0.1);
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
    node
      .style('stroke', function(n) {
        if (neighboring(d, n)) {
          return '#007243';
        } else {
          return strokeFor(n);
        }
      })
      .style('stroke-width', function(n) {
        if (neighboring(d, n)) {
          return 2.0;
        } else {
          return fade(0.2);
        }
      });

    // highlight the node being moused over
    return d3
      .select(this)
      .style('stroke', 'black')
      .style('stroke-width', 5.0);
  };

  var showLinkDetails = function(d, i) {
    let content = `<p class="main">Source: ${d.source.id}</span></p>
    <hr class="tooltip-hr">
    <p class="main">Target:  ${d.target.id}</span></p>`;
    tooltip.showTooltip(content, d3.event);
  };

  var hideLinkDetails = function(d, i) {
    tooltip.hideTooltip();
  };
  // Mouseout function
  var hideDetails = function(d, i) {
    tooltip.hideTooltip();
    // watch out - don't mess with node if search is currently matching
    node
      .style('stroke', function(n) {
        if (!n.searched) {
          return strokeFor(n);
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
    if (link) {
      return link.attr('stroke', '#ddd').attr('stroke-opacity', 0.8);
    }
  };

  // Final act of Network() function is to return the inner 'network()' function.
  return network;
}

export default NodeLinkBlock;
