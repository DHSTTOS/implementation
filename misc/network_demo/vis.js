// Help with the placement of nodes
const RadialPlacement = function() {
  // stores the key -> location values
  let values = d3.map();
  var playButton = d3.select('#play-button');
  // how much to separate each location by
  let increment = 5;
  // how large to make the layout
  let radius = 100;
  // where the center of the layout should be
  let center = { x: 0, y: 0 };
  // what angle to start at
  let start = -120;
  let current = start;
  var l4 = document.getElementsByTagName('L4').length;
  var l3 = document.getElementsByTagName('L3').length;
  var l2 = document.getElementsByTagName('L2').length;

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

    keys.forEach(k => {
      if (k.includes(':')) {
        //increment = 360;
        radius = 100;
        //increment = 360;
        place(k);
      } else if (k.includes('.')) {
        radius = 300;
        // increment = 360;
        place(k);
      } else {
        radius = 600;
        //increment = 360;
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
};

const Network = function() {
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
  const nodeColors = d3.scale.category20();
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
    // console.log(allData.node);
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
      // console.log(link)
      link
        .data([])
        .exit()
        .remove();
      link = null;
    }
    // }

    // start me up!
    force.start();
  };

  network.updateData = function(newData) {
    allData = setupData(newData);
    link.remove();
    node.remove();
    return update();
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
      //}
      // allData.links.forEach(function(d) {
      linkedByIndex[l.source.id + ',' + l.target.id] = 1;
    });
    // console.log(l);
    // console.log(l.source);
    // console.log(l.target);
    // linkedByIndex is used for link sorting
    // return (linkedByIndex[`${l.source.id},${l.target.id}`] = 1);
    //});

    return data;
  };

  // Helper function to map node id's to node objects.
  // Returns d3.map of ids -> nodes
  var mapNodes = function(nodes) {
    const l2Map = d3.map();
    const l3Map = d3.map();
    const l4Map = d3.map();

    nodes.forEach(n => {
      //   if(n.type == "L2"){
      l2Map.set(n.id, n);
      // }else if (n.type == "L3"){
      // l3Map.set(n.id, n);
      // }else{
      // l4Map.set(n.id,n);
      // }
    });

    return l2Map;
    // return new Map([l2Map,l3Map,l4Map]);
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
    /*if (filter === "popular" || filter === "obscure") {
      const playcounts = allNodes.map(d => d.playcount).sort(d3.ascending);
      const cutoff = d3.quantile(playcounts, 0.5);
      filteredNodes = allNodes.filter(function(n) {
        if (filter === "popular") {
          return n.playcount > cutoff;
        } else if (filter === "obscure") {
          return n.playcount <= cutoff;
        }
      });
    }*/

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
    node = nodesG.selectAll('circle.node').data(curNodesData, d => d.id);

    node
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', d => d.radius)
      .style('fill', d => nodeColors(d.id))
      .style('stroke', d => strokeFor(d))
      .style('stroke-width', 1.0);

    node
      .on('mouseover', (d, i) => {
        showDetails(d, i);
      })
      .on('mouseout', hideDetails);

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

  // // switches filter option to new filter
  // var setFilter = newFilter => {
  //   filter = newFilter;
  // };

  // switches sort option to new sort
  // var setSort = newSort => (sort = newSort);

  // tick function for force directed layout
  // var forceTick = function(e) {
  //   node.attr('cx', d => d.x).attr('cy', d => d.y);

  //   return link
  //     .attr('x1', d => d.source.x)
  //     .attr('y1', d => d.source.y)
  //     .attr('x2', d => d.target.x)
  //     .attr('y2', d => d.target.y);
  // };

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
      .rgb(nodeColors(d.id))
      .darker()
      .toString();

  // Mouseover tooltip function
  var showDetails = function(d, i) {
    let content = `<p class="main">id:  ${d.id}</span></p>`;
    content += '<hr class="tooltip-hr">';
    content += `<p class="main">Protocol:  ${d.Protocol}</span></p>`;
    tooltip.showTooltip(content, d3.event);

    // higlight connected links
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
      .style('stroke-width', 2.0);
  };

  var showLinkDetails = function(d, i) {
    let content = `<p class="main">Source: ${d.source.id}</span></p>
    <hr class="tooltip-hr">
    <p class="main">Target:  ${d.target.id}</span></p>`;
    // console.log(d.source.id);
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
};

// function animate({ timing, draw, duration }) {
//   let start = performance.now();

//   requestAnimationFrame(function animate(time) {
//     // timeFraction goes from 0 to 1
//     let timeFraction = (time - start) / duration;
//     if (timeFraction > 1) timeFraction = 1;

//     // calculate the current animation state
//     let progress = timing(timeFraction);

//     draw(progress); // draw it

//     if (timeFraction < 1) {
//       requestAnimationFrame(animate);
//     }
//   });
// }

$(function() {
  const myNetwork = Network();
  // inits the diagram with empty data
  myNetwork('#vis', { nodes: [], links: [] });

  $('#song_select').on('change', function() {
    // d3.json(`data/${songFile}`, json => myNetwork.updateData(json));
    myNetwork.updateData(jsonData);
  });
});

var jsonData = {
  nodes: [
    { id: '00:1f:d0:a4:2a:85', type: 'L2', Protocol: 'Ether' },
    { id: 'ff:ff:ff:ff:ff:ff', type: 'L2', Protocol: 'Ether' },
    { id: '00:0c:29:8f:fe:7f', type: 'L2', Protocol: 'Ether' },
    { id: '60433', type: 'L4', Protocol: 'UDP' },
    { id: '55030', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.250.15', type: 'L3', Protocol: 'IP' },
    { id: '239.192.0.31', type: 'L3', Protocol: 'IP' },
    { id: '00:0c:29:51:9b:c4', type: 'L2', Protocol: 'Ether' },
    { id: '01:00:5e:40:00:1f', type: 'L2', Protocol: 'Ether' },
    { id: '60439', type: 'L4', Protocol: 'UDP' },
    { id: '55015', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.16', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:10', type: 'L2', Protocol: 'Ether' },
    { id: '60579', type: 'L4', Protocol: 'UDP' },
    { id: '49982', type: 'L4', Protocol: 'UDP' },
    { id: '239.255.255.253', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:7f:ff:fd', type: 'L2', Protocol: 'Ether' },
    { id: '60510', type: 'L4', Protocol: 'UDP' },
    { id: '55016', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.17', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:11', type: 'L2', Protocol: 'Ether' },
    { id: '60501', type: 'L4', Protocol: 'UDP' },
    { id: '55012', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.13', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:0d', type: 'L2', Protocol: 'Ether' },
    { id: '138', type: 'L4', Protocol: 'UDP' },
    { id: '138', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.250.155', type: 'L3', Protocol: 'IP' },
    { id: '172.16.255.255', type: 'L3', Protocol: 'IP' },
    { id: '00:13:3b:04:01:33', type: 'L2', Protocol: 'Ether' },
    { id: '137', type: 'L4', Protocol: 'UDP' },
    { id: '137', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.250.59', type: 'L3', Protocol: 'IP' },
    { id: '00:11:6b:94:09:92', type: 'L2', Protocol: 'Ether' },
    { id: '60409', type: 'L4', Protocol: 'UDP' },
    { id: '55001', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.2', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:02', type: 'L2', Protocol: 'Ether' },
    { id: '60567', type: 'L4', Protocol: 'UDP' },
    { id: '55034', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.35', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:23', type: 'L2', Protocol: 'Ether' },
    { id: '60520', type: 'L4', Protocol: 'UDP' },
    { id: '55025', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.26', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:1a', type: 'L2', Protocol: 'Ether' },
    { id: '55024', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.25', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:19', type: 'L2', Protocol: 'Ether' },
    { id: '49981', type: 'L4', Protocol: 'UDP' },
    { id: '49981', type: 'L4', Protocol: 'UDP' },
    { id: '239.195.255.255', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:43:ff:ff', type: 'L2', Protocol: 'Ether' },
    { id: '1936', type: 'L4', Protocol: 'UDP' },
    { id: '7', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.0.1', type: 'L3', Protocol: 'IP' },
    { id: '00:a0:45:12:ef:51', type: 'L2', Protocol: 'Ether' },
    { id: '60542', type: 'L4', Protocol: 'UDP' },
    { id: '55028', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.29', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:1d', type: 'L2', Protocol: 'Ether' },
    { id: '55004', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.5', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:05', type: 'L2', Protocol: 'Ether' },
    { id: '60524', type: 'L4', Protocol: 'UDP' },
    { id: '55019', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.20', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:14', type: 'L2', Protocol: 'Ether' },
    { id: '55027', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.28', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:1c', type: 'L2', Protocol: 'Ether' },
    { id: '1771', type: 'L4', Protocol: 'TCP' },
    { id: '20547', type: 'L4', Protocol: 'TCP' },
    { id: '172.16.97.10', type: 'L3', Protocol: 'IP' },
    { id: '00:1f:d0:a4:fb:41', type: 'L2', Protocol: 'Ether' },
    { id: '55002', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.3', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:03', type: 'L2', Protocol: 'Ether' },
    { id: '60644', type: 'L4', Protocol: 'UDP' },
    { id: '55043', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.44', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:2c', type: 'L2', Protocol: 'Ether' },
    { id: '55017', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.18', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:12', type: 'L2', Protocol: 'Ether' },
    { id: '55003', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.4', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:04', type: 'L2', Protocol: 'Ether' },
    { id: '55005', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.6', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:06', type: 'L2', Protocol: 'Ether' },
    { id: '55029', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.30', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:1e', type: 'L2', Protocol: 'Ether' },
    { id: '60464', type: 'L4', Protocol: 'UDP' },
    { id: '55010', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.11', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:0b', type: 'L2', Protocol: 'Ether' },
    { id: '55037', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.38', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:26', type: 'L2', Protocol: 'Ether' },
    { id: '55006', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.7', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:07', type: 'L2', Protocol: 'Ether' },
    { id: '60476', type: 'L4', Protocol: 'UDP' },
    { id: '55014', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.15', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:0f', type: 'L2', Protocol: 'Ether' },
    { id: '60601', type: 'L4', Protocol: 'UDP' },
    { id: '55036', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.37', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:25', type: 'L2', Protocol: 'Ether' },
    { id: '60442', type: 'L4', Protocol: 'UDP' },
    { id: '55008', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.9', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:09', type: 'L2', Protocol: 'Ether' },
    { id: '55007', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.8', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:08', type: 'L2', Protocol: 'Ether' },
    { id: '55023', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.24', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:18', type: 'L2', Protocol: 'Ether' },
    { id: '55018', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.19', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:13', type: 'L2', Protocol: 'Ether' },
    { id: '60472', type: 'L4', Protocol: 'UDP' },
    { id: '55011', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.12', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:0c', type: 'L2', Protocol: 'Ether' },
    { id: '1740', type: 'L4', Protocol: 'UDP' },
    { id: '1740', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.50.1', type: 'L3', Protocol: 'IP' },
    { id: '00:0a:86:81:32:d1', type: 'L2', Protocol: 'Ether' },
    { id: '1741', type: 'L4', Protocol: 'UDP' },
    { id: '1742', type: 'L4', Protocol: 'UDP' },
    { id: '1743', type: 'L4', Protocol: 'UDP' },
    { id: '1937', type: 'L4', Protocol: 'UDP' },
    { id: '60589', type: 'L4', Protocol: 'UDP' },
    { id: '55033', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.34', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:22', type: 'L2', Protocol: 'Ether' },
    { id: '60671', type: 'L4', Protocol: 'UDP' },
    { id: '55038', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.39', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:27', type: 'L2', Protocol: 'Ether' },
    { id: '60676', type: 'L4', Protocol: 'UDP' },
    { id: '55046', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.47', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:2f', type: 'L2', Protocol: 'Ether' },
    { id: '55026', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.27', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:1b', type: 'L2', Protocol: 'Ether' },
    { id: '60540', type: 'L4', Protocol: 'UDP' },
    { id: '55022', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.23', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:17', type: 'L2', Protocol: 'Ether' },
    { id: '55021', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.22', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:16', type: 'L2', Protocol: 'Ether' },
    { id: '60682', type: 'L4', Protocol: 'UDP' },
    { id: '55045', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.46', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:2e', type: 'L2', Protocol: 'Ether' },
    { id: '60559', type: 'L4', Protocol: 'UDP' },
    { id: '55032', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.33', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:21', type: 'L2', Protocol: 'Ether' },
    { id: '55044', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.45', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:2d', type: 'L2', Protocol: 'Ether' },
    { id: '60494', type: 'L4', Protocol: 'UDP' },
    { id: '55013', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.14', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:0e', type: 'L2', Protocol: 'Ether' },
    { id: '55020', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.21', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:15', type: 'L2', Protocol: 'Ether' },
    { id: '60514', type: 'L4', Protocol: 'UDP' },
    { id: '55031', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.32', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:20', type: 'L2', Protocol: 'Ether' },
    { id: '55000', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.0', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:00', type: 'L2', Protocol: 'Ether' },
    { id: '60654', type: 'L4', Protocol: 'UDP' },
    { id: '55035', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.36', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:24', type: 'L2', Protocol: 'Ether' },
    { id: '55009', type: 'L4', Protocol: 'UDP' },
    { id: '239.192.0.10', type: 'L3', Protocol: 'IP' },
    { id: '01:00:5e:40:00:0a', type: 'L2', Protocol: 'Ether' },
    { id: '68', type: 'L4', Protocol: 'UDP' },
    { id: '67', type: 'L4', Protocol: 'UDP' },
    { id: '0.0.0.0', type: 'L3', Protocol: 'IP' },
    { id: '255.255.255.255', type: 'L3', Protocol: 'IP' },
    { id: '1772', type: 'L4', Protocol: 'TCP' },
    { id: '1938', type: 'L4', Protocol: 'UDP' },
    { id: '5353', type: 'L4', Protocol: 'UDP' },
    { id: '5353', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.250.189', type: 'L3', Protocol: 'IP' },
    { id: '224.0.0.251', type: 'L3', Protocol: 'IP' },
    { id: 'ac:87:a3:1c:09:9a', type: 'L2', Protocol: 'Ether' },
    { id: '01:00:5e:00:00:fb', type: 'L2', Protocol: 'Ether' },
    { id: '172.16.250.188', type: 'L3', Protocol: 'IP' },
    { id: 'b8:09:8a:ba:67:9d', type: 'L2', Protocol: 'Ether' },
    { id: '58186', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.20.20', type: 'L3', Protocol: 'IP' },
    { id: '3c:07:54:10:9c:23', type: 'L2', Protocol: 'Ether' },
    { id: '1939', type: 'L4', Protocol: 'UDP' },
    { id: '1773', type: 'L4', Protocol: 'TCP' },
    { id: '1071', type: 'L4', Protocol: 'TCP' },
    { id: '8100', type: 'L4', Protocol: 'TCP' },
    { id: '172.16.0.15', type: 'L3', Protocol: 'IP' },
    { id: '00:a0:45:07:47:b4', type: 'L2', Protocol: 'Ether' },
    { id: '1940', type: 'L4', Protocol: 'UDP' },
    { id: '1941', type: 'L4', Protocol: 'UDP' },
    { id: '1775', type: 'L4', Protocol: 'TCP' },
    { id: '1942', type: 'L4', Protocol: 'UDP' },
    { id: '1776', type: 'L4', Protocol: 'TCP' },
    { id: '1943', type: 'L4', Protocol: 'UDP' },
    { id: '1141', type: 'L4', Protocol: 'TCP' },
    { id: '502', type: 'L4', Protocol: 'TCP' },
    { id: '172.16.0.12', type: 'L3', Protocol: 'IP' },
    { id: '00:07:92:00:72:20', type: 'L2', Protocol: 'Ether' },
    { id: '1944', type: 'L4', Protocol: 'UDP' },
    { id: '1777', type: 'L4', Protocol: 'TCP' },
    { id: '1945', type: 'L4', Protocol: 'UDP' },
    { id: '1779', type: 'L4', Protocol: 'TCP' },
    { id: '1946', type: 'L4', Protocol: 'UDP' },
    { id: '1780', type: 'L4', Protocol: 'TCP' },
    { id: '172.16.2.1', type: 'L3', Protocol: 'IP' },
    { id: '00:1b:53:88:14:f9', type: 'L2', Protocol: 'Ether' },
    { id: '1948', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.250.37', type: 'L3', Protocol: 'IP' },
    { id: 'd4:ae:52:c9:f0:6a', type: 'L2', Protocol: 'Ether' },
    { id: '1949', type: 'L4', Protocol: 'UDP' },
    { id: '1782', type: 'L4', Protocol: 'TCP' },
    { id: '1072', type: 'L4', Protocol: 'TCP' },
    { id: '1950', type: 'L4', Protocol: 'UDP' },
    { id: '1783', type: 'L4', Protocol: 'TCP' },
    { id: '1951', type: 'L4', Protocol: 'UDP' },
    { id: '1952', type: 'L4', Protocol: 'UDP' },
    { id: '1784', type: 'L4', Protocol: 'TCP' },
    { id: '61636', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.70.85', type: 'L3', Protocol: 'IP' },
    { id: '00:13:3b:00:06:69', type: 'L2', Protocol: 'Ether' },
    { id: '61640', type: 'L4', Protocol: 'UDP' },
    { id: '1953', type: 'L4', Protocol: 'UDP' },
    { id: '61643', type: 'L4', Protocol: 'UDP' },
    { id: '61647', type: 'L4', Protocol: 'UDP' },
    { id: '1786', type: 'L4', Protocol: 'TCP' },
    { id: '61651', type: 'L4', Protocol: 'UDP' },
    { id: '1954', type: 'L4', Protocol: 'UDP' },
    { id: '1073', type: 'L4', Protocol: 'TCP' },
    { id: '61655', type: 'L4', Protocol: 'UDP' },
    { id: '61659', type: 'L4', Protocol: 'UDP' },
    { id: '1955', type: 'L4', Protocol: 'UDP' },
    { id: '61663', type: 'L4', Protocol: 'UDP' },
    { id: '61666', type: 'L4', Protocol: 'UDP' },
    { id: '1787', type: 'L4', Protocol: 'TCP' },
    { id: '1142', type: 'L4', Protocol: 'TCP' },
    { id: '60578', type: 'L4', Protocol: 'UDP' },
    { id: '21212', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.250.24', type: 'L3', Protocol: 'IP' },
    { id: '00:11:ce:00:63:f9', type: 'L2', Protocol: 'Ether' },
    { id: '61678', type: 'L4', Protocol: 'UDP' },
    { id: '61681', type: 'L4', Protocol: 'UDP' },
    { id: '1957', type: 'L4', Protocol: 'UDP' },
    { id: '1788', type: 'L4', Protocol: 'TCP' },
    { id: '61685', type: 'L4', Protocol: 'UDP' },
    { id: '1074', type: 'L4', Protocol: 'TCP' },
    { id: '61689', type: 'L4', Protocol: 'UDP' },
    { id: '1958', type: 'L4', Protocol: 'UDP' },
    { id: '61692', type: 'L4', Protocol: 'UDP' },
    { id: '61696', type: 'L4', Protocol: 'UDP' },
    { id: '1790', type: 'L4', Protocol: 'TCP' },
    { id: '61700', type: 'L4', Protocol: 'UDP' },
    { id: '1960', type: 'L4', Protocol: 'UDP' },
    { id: '61704', type: 'L4', Protocol: 'UDP' },
    { id: '61708', type: 'L4', Protocol: 'UDP' },
    { id: '51496', type: 'L4', Protocol: 'TCP' },
    { id: '1791', type: 'L4', Protocol: 'TCP' },
    { id: '1075', type: 'L4', Protocol: 'TCP' },
    { id: '1025', type: 'L4', Protocol: 'UDP' },
    { id: '34964', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.0.11', type: 'L3', Protocol: 'IP' },
    { id: '00:a0:45:42:9c:52', type: 'L2', Protocol: 'Ether' },
    { id: '1024', type: 'L4', Protocol: 'UDP' },
    { id: '9011', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.0.3', type: 'L3', Protocol: 'IP' },
    { id: '00:01:05:09:11:35', type: 'L2', Protocol: 'Ether' },
    { id: '50000', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.0.6', type: 'L3', Protocol: 'IP' },
    { id: '08:00:06:6c:03:73', type: 'L2', Protocol: 'Ether' },
    { id: '1203', type: 'L4', Protocol: 'UDP' },
    { id: '172.16.0.7', type: 'L3', Protocol: 'IP' },
    { id: '00:a0:45:18:d4:23', type: 'L2', Protocol: 'Ether' },
    { id: '172.16.0.4', type: 'L3', Protocol: 'IP' },
    { id: '00:a0:45:18:d3:b3', type: 'L2', Protocol: 'Ether' },
    { id: '172.16.0.9', type: 'L3', Protocol: 'IP' },
    { id: '00:a0:45:05:2a:0e', type: 'L2', Protocol: 'Ether' },
    { id: '172.16.0.8', type: 'L3', Protocol: 'IP' },
    { id: '00:a0:45:07:62:97', type: 'L2', Protocol: 'Ether' },
    { id: '172.16.0.2', type: 'L3', Protocol: 'IP' },
    { id: '00:30:de:03:b6:1a', type: 'L2', Protocol: 'Ether' },
    { id: '47923', type: 'L4', Protocol: 'UDP' },
    { id: '1027', type: 'L4', Protocol: 'TCP' },
    { id: '172.16.0.10', type: 'L3', Protocol: 'IP' },
    { id: '00:0e:8c:93:d5:93', type: 'L2', Protocol: 'Ether' },
    { id: '172.16.0.5', type: 'L3', Protocol: 'IP' },
    { id: '00:a0:45:19:0c:7b', type: 'L2', Protocol: 'Ether' },
    { id: '169.254.35.103', type: 'L3', Protocol: 'IP' },
    { id: '169.254.255.255', type: 'L3', Protocol: 'IP' },
    { id: '1143', type: 'L4', Protocol: 'TCP' },
    { id: '1216', type: 'L4', Protocol: 'UDP' },
    { id: '1962', type: 'L4', Protocol: 'TCP' },
    { id: '172.16.23.2', type: 'L3', Protocol: 'IP' },
    { id: '224.0.0.2', type: 'L3', Protocol: 'IP' },
    { id: '00:a0:57:18:59:7e', type: 'L2', Protocol: 'Ether' },
    { id: '01:00:5e:00:00:02', type: 'L2', Protocol: 'Ether' },
  ],
  links: [
    { source: '172.16.250.15', target: '60433' },
    { source: '239.192.0.31', target: '55030' },
    { source: '00:0c:29:51:9b:c4', target: '172.16.250.15' },
    { source: '01:00:5e:40:00:1f', target: '239.192.0.31' },
    { source: '60433', target: '55030' },
    { source: '00:0c:29:51:9b:c4', target: '172.16.250.15' },
    { source: '01:00:5e:40:00:1f', target: '239.192.0.31' },
    { source: '172.16.250.15', target: '239.192.0.31' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:1f' },
    { source: '172.16.250.15', target: '60439' },
    { source: '239.192.0.16', target: '55015' },
    { source: '01:00:5e:40:00:10', target: '239.192.0.16' },
    { source: '60439', target: '55015' },
    { source: '01:00:5e:40:00:10', target: '239.192.0.16' },
    { source: '172.16.250.15', target: '239.192.0.16' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:10' },
    { source: '172.16.250.15', target: '60579' },
    { source: '239.255.255.253', target: '49982' },
    { source: '01:00:5e:7f:ff:fd', target: '239.255.255.253' },
    { source: '60579', target: '49982' },
    { source: '01:00:5e:7f:ff:fd', target: '239.255.255.253' },
    { source: '172.16.250.15', target: '239.255.255.253' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:7f:ff:fd' },
    { source: '172.16.250.15', target: '60510' },
    { source: '239.192.0.17', target: '55016' },
    { source: '01:00:5e:40:00:11', target: '239.192.0.17' },
    { source: '60510', target: '55016' },
    { source: '01:00:5e:40:00:11', target: '239.192.0.17' },
    { source: '172.16.250.15', target: '239.192.0.17' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:11' },
    { source: '172.16.250.15', target: '60501' },
    { source: '239.192.0.13', target: '55012' },
    { source: '01:00:5e:40:00:0d', target: '239.192.0.13' },
    { source: '60501', target: '55012' },
    { source: '01:00:5e:40:00:0d', target: '239.192.0.13' },
    { source: '172.16.250.15', target: '239.192.0.13' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:0d' },
    { source: '172.16.250.155', target: '138' },
    { source: '172.16.255.255', target: '138' },
    { source: '00:13:3b:04:01:33', target: '172.16.250.155' },
    { source: 'ff:ff:ff:ff:ff:ff', target: '172.16.255.255' },
    { source: '138', target: '138' },
    { source: '00:13:3b:04:01:33', target: '172.16.250.155' },
    { source: 'ff:ff:ff:ff:ff:ff', target: '172.16.255.255' },
    { source: '172.16.250.155', target: '172.16.255.255' },
    { source: '00:13:3b:04:01:33', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.250.59', target: '137' },
    { source: '172.16.255.255', target: '137' },
    { source: '00:11:6b:94:09:92', target: '172.16.250.59' },
    { source: '137', target: '137' },
    { source: '00:11:6b:94:09:92', target: '172.16.250.59' },
    { source: '172.16.250.59', target: '172.16.255.255' },
    { source: '00:11:6b:94:09:92', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.250.15', target: '60409' },
    { source: '239.192.0.2', target: '55001' },
    { source: '01:00:5e:40:00:02', target: '239.192.0.2' },
    { source: '60409', target: '55001' },
    { source: '01:00:5e:40:00:02', target: '239.192.0.2' },
    { source: '172.16.250.15', target: '239.192.0.2' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:02' },
    { source: '172.16.250.15', target: '60567' },
    { source: '239.192.0.35', target: '55034' },
    { source: '01:00:5e:40:00:23', target: '239.192.0.35' },
    { source: '60567', target: '55034' },
    { source: '01:00:5e:40:00:23', target: '239.192.0.35' },
    { source: '172.16.250.15', target: '239.192.0.35' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:23' },
    { source: '172.16.250.15', target: '60520' },
    { source: '239.192.0.26', target: '55025' },
    { source: '01:00:5e:40:00:1a', target: '239.192.0.26' },
    { source: '60520', target: '55025' },
    { source: '01:00:5e:40:00:1a', target: '239.192.0.26' },
    { source: '172.16.250.15', target: '239.192.0.26' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:1a' },
    { source: '239.192.0.25', target: '55024' },
    { source: '01:00:5e:40:00:19', target: '239.192.0.25' },
    { source: '60520', target: '55024' },
    { source: '01:00:5e:40:00:19', target: '239.192.0.25' },
    { source: '172.16.250.15', target: '239.192.0.25' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:19' },
    { source: '172.16.250.15', target: '49981' },
    { source: '239.195.255.255', target: '49981' },
    { source: '01:00:5e:43:ff:ff', target: '239.195.255.255' },
    { source: '49981', target: '49981' },
    { source: '01:00:5e:43:ff:ff', target: '239.195.255.255' },
    { source: '172.16.250.15', target: '239.195.255.255' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:43:ff:ff' },
    { source: '172.16.250.59', target: '1936' },
    { source: '172.16.0.1', target: '7' },
    { source: '00:a0:45:12:ef:51', target: '172.16.0.1' },
    { source: '1936', target: '7' },
    { source: '00:a0:45:12:ef:51', target: '172.16.0.1' },
    { source: '172.16.250.59', target: '172.16.0.1' },
    { source: '00:11:6b:94:09:92', target: '00:a0:45:12:ef:51' },
    { source: '172.16.250.15', target: '60542' },
    { source: '239.192.0.29', target: '55028' },
    { source: '01:00:5e:40:00:1d', target: '239.192.0.29' },
    { source: '60542', target: '55028' },
    { source: '01:00:5e:40:00:1d', target: '239.192.0.29' },
    { source: '172.16.250.15', target: '239.192.0.29' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:1d' },
    { source: '239.192.0.5', target: '55004' },
    { source: '01:00:5e:40:00:05', target: '239.192.0.5' },
    { source: '60409', target: '55004' },
    { source: '01:00:5e:40:00:05', target: '239.192.0.5' },
    { source: '172.16.250.15', target: '239.192.0.5' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:05' },
    { source: '172.16.250.15', target: '60524' },
    { source: '239.192.0.20', target: '55019' },
    { source: '01:00:5e:40:00:14', target: '239.192.0.20' },
    { source: '60524', target: '55019' },
    { source: '01:00:5e:40:00:14', target: '239.192.0.20' },
    { source: '172.16.250.15', target: '239.192.0.20' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:14' },
    { source: '239.192.0.28', target: '55027' },
    { source: '01:00:5e:40:00:1c', target: '239.192.0.28' },
    { source: '60520', target: '55027' },
    { source: '01:00:5e:40:00:1c', target: '239.192.0.28' },
    { source: '172.16.250.15', target: '239.192.0.28' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:1c' },
    { source: '172.16.97.10', target: '1771' },
    { source: '172.16.0.1', target: '20547' },
    { source: '00:1f:d0:a4:fb:41', target: '172.16.97.10' },
    { source: '1771', target: '20547' },
    { source: '00:1f:d0:a4:fb:41', target: '172.16.97.10' },
    { source: '172.16.97.10', target: '172.16.0.1' },
    { source: '00:1f:d0:a4:fb:41', target: '00:a0:45:12:ef:51' },
    { source: '239.192.0.3', target: '55002' },
    { source: '01:00:5e:40:00:03', target: '239.192.0.3' },
    { source: '60409', target: '55002' },
    { source: '01:00:5e:40:00:03', target: '239.192.0.3' },
    { source: '172.16.250.15', target: '239.192.0.3' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:03' },
    { source: '172.16.250.15', target: '60644' },
    { source: '239.192.0.44', target: '55043' },
    { source: '01:00:5e:40:00:2c', target: '239.192.0.44' },
    { source: '60644', target: '55043' },
    { source: '01:00:5e:40:00:2c', target: '239.192.0.44' },
    { source: '172.16.250.15', target: '239.192.0.44' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:2c' },
    { source: '239.192.0.18', target: '55017' },
    { source: '01:00:5e:40:00:12', target: '239.192.0.18' },
    { source: '60520', target: '55017' },
    { source: '01:00:5e:40:00:12', target: '239.192.0.18' },
    { source: '172.16.250.15', target: '239.192.0.18' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:12' },
    { source: '239.192.0.4', target: '55003' },
    { source: '01:00:5e:40:00:04', target: '239.192.0.4' },
    { source: '60409', target: '55003' },
    { source: '01:00:5e:40:00:04', target: '239.192.0.4' },
    { source: '172.16.250.15', target: '239.192.0.4' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:04' },
    { source: '239.192.0.6', target: '55005' },
    { source: '01:00:5e:40:00:06', target: '239.192.0.6' },
    { source: '60409', target: '55005' },
    { source: '01:00:5e:40:00:06', target: '239.192.0.6' },
    { source: '172.16.250.15', target: '239.192.0.6' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:06' },
    { source: '239.192.0.30', target: '55029' },
    { source: '01:00:5e:40:00:1e', target: '239.192.0.30' },
    { source: '60520', target: '55029' },
    { source: '01:00:5e:40:00:1e', target: '239.192.0.30' },
    { source: '172.16.250.15', target: '239.192.0.30' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:1e' },
    { source: '172.16.250.15', target: '60464' },
    { source: '239.192.0.11', target: '55010' },
    { source: '01:00:5e:40:00:0b', target: '239.192.0.11' },
    { source: '60464', target: '55010' },
    { source: '01:00:5e:40:00:0b', target: '239.192.0.11' },
    { source: '172.16.250.15', target: '239.192.0.11' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:0b' },
    { source: '239.192.0.38', target: '55037' },
    { source: '01:00:5e:40:00:26', target: '239.192.0.38' },
    { source: '60567', target: '55037' },
    { source: '01:00:5e:40:00:26', target: '239.192.0.38' },
    { source: '172.16.250.15', target: '239.192.0.38' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:26' },
    { source: '239.192.0.7', target: '55006' },
    { source: '01:00:5e:40:00:07', target: '239.192.0.7' },
    { source: '60409', target: '55006' },
    { source: '01:00:5e:40:00:07', target: '239.192.0.7' },
    { source: '172.16.250.15', target: '239.192.0.7' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:07' },
    { source: '172.16.250.15', target: '60476' },
    { source: '239.192.0.15', target: '55014' },
    { source: '01:00:5e:40:00:0f', target: '239.192.0.15' },
    { source: '60476', target: '55014' },
    { source: '01:00:5e:40:00:0f', target: '239.192.0.15' },
    { source: '172.16.250.15', target: '239.192.0.15' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:0f' },
    { source: '172.16.250.15', target: '60601' },
    { source: '239.192.0.37', target: '55036' },
    { source: '01:00:5e:40:00:25', target: '239.192.0.37' },
    { source: '60601', target: '55036' },
    { source: '01:00:5e:40:00:25', target: '239.192.0.37' },
    { source: '172.16.250.15', target: '239.192.0.37' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:25' },
    { source: '172.16.250.15', target: '60442' },
    { source: '239.192.0.9', target: '55008' },
    { source: '01:00:5e:40:00:09', target: '239.192.0.9' },
    { source: '60442', target: '55008' },
    { source: '01:00:5e:40:00:09', target: '239.192.0.9' },
    { source: '172.16.250.15', target: '239.192.0.9' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:09' },
    { source: '239.192.0.8', target: '55007' },
    { source: '01:00:5e:40:00:08', target: '239.192.0.8' },
    { source: '60409', target: '55007' },
    { source: '01:00:5e:40:00:08', target: '239.192.0.8' },
    { source: '172.16.250.15', target: '239.192.0.8' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:08' },
    { source: '239.192.0.24', target: '55023' },
    { source: '01:00:5e:40:00:18', target: '239.192.0.24' },
    { source: '60510', target: '55023' },
    { source: '01:00:5e:40:00:18', target: '239.192.0.24' },
    { source: '172.16.250.15', target: '239.192.0.24' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:18' },
    { source: '239.192.0.19', target: '55018' },
    { source: '01:00:5e:40:00:13', target: '239.192.0.19' },
    { source: '60442', target: '55018' },
    { source: '01:00:5e:40:00:13', target: '239.192.0.19' },
    { source: '172.16.250.15', target: '239.192.0.19' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:13' },
    { source: '172.16.250.15', target: '60472' },
    { source: '239.192.0.12', target: '55011' },
    { source: '01:00:5e:40:00:0c', target: '239.192.0.12' },
    { source: '60472', target: '55011' },
    { source: '01:00:5e:40:00:0c', target: '239.192.0.12' },
    { source: '172.16.250.15', target: '239.192.0.12' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:0c' },
    { source: '172.16.50.1', target: '1740' },
    { source: '172.16.255.255', target: '1740' },
    { source: '00:0a:86:81:32:d1', target: '172.16.50.1' },
    { source: '1740', target: '1740' },
    { source: '00:0a:86:81:32:d1', target: '172.16.50.1' },
    { source: '172.16.50.1', target: '172.16.255.255' },
    { source: '00:0a:86:81:32:d1', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.255.255', target: '1741' },
    { source: '1740', target: '1741' },
    { source: '172.16.255.255', target: '1742' },
    { source: '1740', target: '1742' },
    { source: '172.16.255.255', target: '1743' },
    { source: '1740', target: '1743' },
    { source: '172.16.250.59', target: '1937' },
    { source: '1937', target: '7' },
    { source: '172.16.250.15', target: '60589' },
    { source: '239.192.0.34', target: '55033' },
    { source: '01:00:5e:40:00:22', target: '239.192.0.34' },
    { source: '60589', target: '55033' },
    { source: '01:00:5e:40:00:22', target: '239.192.0.34' },
    { source: '172.16.250.15', target: '239.192.0.34' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:22' },
    { source: '172.16.250.15', target: '60671' },
    { source: '239.192.0.39', target: '55038' },
    { source: '01:00:5e:40:00:27', target: '239.192.0.39' },
    { source: '60671', target: '55038' },
    { source: '01:00:5e:40:00:27', target: '239.192.0.39' },
    { source: '172.16.250.15', target: '239.192.0.39' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:27' },
    { source: '172.16.250.15', target: '60676' },
    { source: '239.192.0.47', target: '55046' },
    { source: '01:00:5e:40:00:2f', target: '239.192.0.47' },
    { source: '60676', target: '55046' },
    { source: '01:00:5e:40:00:2f', target: '239.192.0.47' },
    { source: '172.16.250.15', target: '239.192.0.47' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:2f' },
    { source: '239.192.0.27', target: '55026' },
    { source: '01:00:5e:40:00:1b', target: '239.192.0.27' },
    { source: '60510', target: '55026' },
    { source: '01:00:5e:40:00:1b', target: '239.192.0.27' },
    { source: '172.16.250.15', target: '239.192.0.27' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:1b' },
    { source: '172.16.250.15', target: '60540' },
    { source: '239.192.0.23', target: '55022' },
    { source: '01:00:5e:40:00:17', target: '239.192.0.23' },
    { source: '60540', target: '55022' },
    { source: '01:00:5e:40:00:17', target: '239.192.0.23' },
    { source: '172.16.250.15', target: '239.192.0.23' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:17' },
    { source: '172.16.250.15', target: '137' },
    { source: '172.16.250.15', target: '172.16.255.255' },
    { source: '00:0c:29:51:9b:c4', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '239.192.0.22', target: '55021' },
    { source: '01:00:5e:40:00:16', target: '239.192.0.22' },
    { source: '60520', target: '55021' },
    { source: '01:00:5e:40:00:16', target: '239.192.0.22' },
    { source: '172.16.250.15', target: '239.192.0.22' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:16' },
    { source: '172.16.250.15', target: '60682' },
    { source: '239.192.0.46', target: '55045' },
    { source: '01:00:5e:40:00:2e', target: '239.192.0.46' },
    { source: '60682', target: '55045' },
    { source: '01:00:5e:40:00:2e', target: '239.192.0.46' },
    { source: '172.16.250.15', target: '239.192.0.46' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:2e' },
    { source: '172.16.250.15', target: '60559' },
    { source: '239.192.0.33', target: '55032' },
    { source: '01:00:5e:40:00:21', target: '239.192.0.33' },
    { source: '60559', target: '55032' },
    { source: '01:00:5e:40:00:21', target: '239.192.0.33' },
    { source: '172.16.250.15', target: '239.192.0.33' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:21' },
    { source: '239.192.0.45', target: '55044' },
    { source: '01:00:5e:40:00:2d', target: '239.192.0.45' },
    { source: '60682', target: '55044' },
    { source: '01:00:5e:40:00:2d', target: '239.192.0.45' },
    { source: '172.16.250.15', target: '239.192.0.45' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:2d' },
    { source: '172.16.250.15', target: '60494' },
    { source: '239.192.0.14', target: '55013' },
    { source: '01:00:5e:40:00:0e', target: '239.192.0.14' },
    { source: '60494', target: '55013' },
    { source: '01:00:5e:40:00:0e', target: '239.192.0.14' },
    { source: '172.16.250.15', target: '239.192.0.14' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:0e' },
    { source: '239.192.0.21', target: '55020' },
    { source: '01:00:5e:40:00:15', target: '239.192.0.21' },
    { source: '60510', target: '55020' },
    { source: '01:00:5e:40:00:15', target: '239.192.0.21' },
    { source: '172.16.250.15', target: '239.192.0.21' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:15' },
    { source: '172.16.250.15', target: '60514' },
    { source: '239.192.0.32', target: '55031' },
    { source: '01:00:5e:40:00:20', target: '239.192.0.32' },
    { source: '60514', target: '55031' },
    { source: '01:00:5e:40:00:20', target: '239.192.0.32' },
    { source: '172.16.250.15', target: '239.192.0.32' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:20' },
    { source: '239.192.0.0', target: '55000' },
    { source: '01:00:5e:40:00:00', target: '239.192.0.0' },
    { source: '60409', target: '55000' },
    { source: '01:00:5e:40:00:00', target: '239.192.0.0' },
    { source: '172.16.250.15', target: '239.192.0.0' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:00' },
    { source: '172.16.250.15', target: '60654' },
    { source: '239.192.0.36', target: '55035' },
    { source: '01:00:5e:40:00:24', target: '239.192.0.36' },
    { source: '60654', target: '55035' },
    { source: '01:00:5e:40:00:24', target: '239.192.0.36' },
    { source: '172.16.250.15', target: '239.192.0.36' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:24' },
    { source: '239.192.0.10', target: '55009' },
    { source: '01:00:5e:40:00:0a', target: '239.192.0.10' },
    { source: '60439', target: '55009' },
    { source: '01:00:5e:40:00:0a', target: '239.192.0.10' },
    { source: '172.16.250.15', target: '239.192.0.10' },
    { source: '00:0c:29:51:9b:c4', target: '01:00:5e:40:00:0a' },
    { source: '0.0.0.0', target: '68' },
    { source: '255.255.255.255', target: '67' },
    { source: '00:1f:d0:a4:2a:85', target: '0.0.0.0' },
    { source: 'ff:ff:ff:ff:ff:ff', target: '255.255.255.255' },
    { source: '68', target: '67' },
    { source: '00:1f:d0:a4:2a:85', target: '0.0.0.0' },
    { source: 'ff:ff:ff:ff:ff:ff', target: '255.255.255.255' },
    { source: '0.0.0.0', target: '255.255.255.255' },
    { source: '00:1f:d0:a4:2a:85', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.97.10', target: '1772' },
    { source: '1772', target: '20547' },
    { source: '172.16.250.59', target: '1938' },
    { source: '1938', target: '7' },
    { source: '172.16.250.189', target: '5353' },
    { source: '224.0.0.251', target: '5353' },
    { source: 'ac:87:a3:1c:09:9a', target: '172.16.250.189' },
    { source: '01:00:5e:00:00:fb', target: '224.0.0.251' },
    { source: '5353', target: '5353' },
    { source: 'ac:87:a3:1c:09:9a', target: '172.16.250.189' },
    { source: '01:00:5e:00:00:fb', target: '224.0.0.251' },
    { source: '172.16.250.189', target: '224.0.0.251' },
    { source: 'ac:87:a3:1c:09:9a', target: '01:00:5e:00:00:fb' },
    { source: '172.16.250.188', target: '5353' },
    { source: 'b8:09:8a:ba:67:9d', target: '172.16.250.188' },
    { source: 'b8:09:8a:ba:67:9d', target: '172.16.250.188' },
    { source: '172.16.250.188', target: '224.0.0.251' },
    { source: 'b8:09:8a:ba:67:9d', target: '01:00:5e:00:00:fb' },
    { source: '172.16.250.189', target: '137' },
    { source: '172.16.250.189', target: '172.16.255.255' },
    { source: 'ac:87:a3:1c:09:9a', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.250.188', target: '137' },
    { source: '172.16.250.188', target: '172.16.255.255' },
    { source: 'b8:09:8a:ba:67:9d', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.250.188', target: '58186' },
    { source: '58186', target: '137' },
    { source: '172.16.250.189', target: '138' },
    { source: '172.16.250.155', target: '137' },
    { source: '172.16.20.20', target: '137' },
    { source: '3c:07:54:10:9c:23', target: '172.16.20.20' },
    { source: '3c:07:54:10:9c:23', target: '172.16.20.20' },
    { source: '172.16.20.20', target: '172.16.255.255' },
    { source: '3c:07:54:10:9c:23', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.250.188', target: '138' },
    { source: '172.16.250.59', target: '1939' },
    { source: '1939', target: '7' },
    { source: '172.16.97.10', target: '1773' },
    { source: '1773', target: '20547' },
    { source: '172.16.0.15', target: '1071' },
    { source: '172.16.0.1', target: '8100' },
    { source: '00:a0:45:07:47:b4', target: '172.16.0.15' },
    { source: '1071', target: '8100' },
    { source: '00:a0:45:07:47:b4', target: '172.16.0.15' },
    { source: '172.16.0.15', target: '172.16.0.1' },
    { source: '00:a0:45:07:47:b4', target: '00:a0:45:12:ef:51' },
    { source: '172.16.250.59', target: '1940' },
    { source: '1940', target: '7' },
    { source: '172.16.250.59', target: '1941' },
    { source: '1941', target: '7' },
    { source: '172.16.97.10', target: '1775' },
    { source: '1775', target: '20547' },
    { source: '172.16.250.59', target: '1942' },
    { source: '1942', target: '7' },
    { source: '172.16.97.10', target: '1776' },
    { source: '1776', target: '20547' },
    { source: '172.16.250.59', target: '1943' },
    { source: '1943', target: '7' },
    { source: '172.16.0.12', target: '1141' },
    { source: '172.16.0.1', target: '502' },
    { source: '00:07:92:00:72:20', target: '172.16.0.12' },
    { source: '1141', target: '502' },
    { source: '00:07:92:00:72:20', target: '172.16.0.12' },
    { source: '172.16.0.12', target: '172.16.0.1' },
    { source: '00:07:92:00:72:20', target: '00:a0:45:12:ef:51' },
    { source: '172.16.250.59', target: '1944' },
    { source: '1944', target: '7' },
    { source: '172.16.97.10', target: '1777' },
    { source: '1777', target: '20547' },
    { source: '172.16.250.59', target: '1945' },
    { source: '1945', target: '7' },
    { source: '172.16.97.10', target: '1779' },
    { source: '1779', target: '20547' },
    { source: '172.16.250.59', target: '1946' },
    { source: '1946', target: '7' },
    { source: '172.16.97.10', target: '1780' },
    { source: '1780', target: '20547' },
    { source: '172.16.250.155', target: '68' },
    { source: '172.16.250.155', target: '255.255.255.255' },
    { source: '172.16.2.1', target: '67' },
    { source: '255.255.255.255', target: '68' },
    { source: '00:1b:53:88:14:f9', target: '172.16.2.1' },
    { source: '67', target: '68' },
    { source: '00:1b:53:88:14:f9', target: '172.16.2.1' },
    { source: '172.16.2.1', target: '255.255.255.255' },
    { source: '00:1b:53:88:14:f9', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.250.59', target: '1948' },
    { source: '1948', target: '7' },
    { source: '172.16.250.37', target: '1740' },
    { source: 'd4:ae:52:c9:f0:6a', target: '172.16.250.37' },
    { source: 'd4:ae:52:c9:f0:6a', target: '172.16.250.37' },
    { source: '172.16.250.37', target: '172.16.255.255' },
    { source: 'd4:ae:52:c9:f0:6a', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.250.59', target: '1949' },
    { source: '1949', target: '7' },
    { source: '172.16.97.10', target: '1782' },
    { source: '1782', target: '20547' },
    { source: '172.16.0.15', target: '1072' },
    { source: '1072', target: '8100' },
    { source: '172.16.250.59', target: '1950' },
    { source: '1950', target: '7' },
    { source: '172.16.97.10', target: '1783' },
    { source: '1783', target: '20547' },
    { source: '172.16.250.59', target: '1951' },
    { source: '1951', target: '7' },
    { source: '172.16.250.59', target: '1952' },
    { source: '1952', target: '7' },
    { source: '172.16.97.10', target: '1784' },
    { source: '1784', target: '20547' },
    { source: '172.16.0.1', target: '137' },
    { source: '172.16.0.1', target: '172.16.255.255' },
    { source: '00:a0:45:12:ef:51', target: 'ff:ff:ff:ff:ff:ff' },
    { source: '172.16.70.85', target: '61636' },
    { source: '00:13:3b:00:06:69', target: '172.16.70.85' },
    { source: '61636', target: '7' },
    { source: '00:13:3b:00:06:69', target: '172.16.70.85' },
    { source: '172.16.70.85', target: '172.16.0.1' },
    { source: '00:13:3b:00:06:69', target: '00:a0:45:12:ef:51' },
    { source: '172.16.0.1', target: '172.16.70.85' },
    { source: '172.16.70.85', target: '61640' },
    { source: '61640', target: '7' },
    { source: '172.16.250.59', target: '1953' },
    { source: '1953', target: '7' },
    { source: '172.16.0.1', target: '172.16.250.59' },
    { source: '8100', target: '1072' },
    { source: '172.16.0.1', target: '172.16.0.15' },
    { source: '00:a0:45:12:ef:51', target: '00:a0:45:07:47:b4' },
    { source: '172.16.70.85', target: '61643' },
    { source: '61643', target: '7' },
    { source: '172.16.70.85', target: '61647' },
    { source: '61647', target: '7' },
    { source: '172.16.97.10', target: '1786' },
    { source: '1786', target: '20547' },
    { source: '20547', target: '1786' },
    { source: '172.16.0.1', target: '172.16.97.10' },
    { source: '00:a0:45:12:ef:51', target: '00:1f:d0:a4:fb:41' },
    { source: '172.16.70.85', target: '61651' },
    { source: '61651', target: '7' },
    { source: '172.16.250.59', target: '1954' },
    { source: '1954', target: '7' },
    { source: '172.16.0.15', target: '1073' },
    { source: '1073', target: '8100' },
    { source: '8100', target: '1073' },
    { source: '172.16.70.85', target: '61655' },
    { source: '61655', target: '7' },
    { source: '172.16.70.85', target: '61659' },
    { source: '61659', target: '7' },
    { source: '172.16.250.59', target: '1955' },
    { source: '1955', target: '7' },
    { source: '172.16.70.85', target: '61663' },
    { source: '61663', target: '7' },
    { source: '172.16.70.85', target: '61666' },
    { source: '61666', target: '7' },
    { source: '172.16.97.10', target: '1787' },
    { source: '1787', target: '20547' },
    { source: '172.16.0.12', target: '1142' },
    { source: '1142', target: '502' },
    { source: '172.16.250.15', target: '60578' },
    { source: '172.16.250.24', target: '21212' },
    { source: '00:11:ce:00:63:f9', target: '172.16.250.24' },
    { source: '60578', target: '21212' },
    { source: '00:11:ce:00:63:f9', target: '172.16.250.24' },
    { source: '172.16.250.15', target: '172.16.250.24' },
    { source: '00:0c:29:51:9b:c4', target: '00:11:ce:00:63:f9' },
    { source: '172.16.70.85', target: '61678' },
    { source: '61678', target: '7' },
    { source: '172.16.70.85', target: '61681' },
    { source: '61681', target: '7' },
    { source: '172.16.250.59', target: '1957' },
    { source: '1957', target: '7' },
    { source: '172.16.97.10', target: '1788' },
    { source: '1788', target: '20547' },
    { source: '172.16.70.85', target: '61685' },
    { source: '61685', target: '7' },
    { source: '172.16.0.15', target: '1074' },
    { source: '1074', target: '8100' },
    { source: '172.16.70.85', target: '61689' },
    { source: '61689', target: '7' },
    { source: '172.16.250.59', target: '1958' },
    { source: '1958', target: '7' },
    { source: '172.16.70.85', target: '61692' },
    { source: '61692', target: '7' },
    { source: '172.16.70.85', target: '61696' },
    { source: '61696', target: '7' },
    { source: '172.16.97.10', target: '1790' },
    { source: '1790', target: '20547' },
    { source: '172.16.70.85', target: '61700' },
    { source: '61700', target: '7' },
    { source: '172.16.250.59', target: '1960' },
    { source: '1960', target: '7' },
    { source: '172.16.70.85', target: '61704' },
    { source: '61704', target: '7' },
    { source: '172.16.70.85', target: '61708' },
    { source: '61708', target: '7' },
    { source: '7', target: '61708' },
    { source: '00:a0:45:12:ef:51', target: '00:13:3b:00:06:69' },
    { source: '172.16.70.85', target: '51496' },
    { source: '51496', target: '20547' },
    { source: '20547', target: '51496' },
    { source: '8100', target: '1074' },
    { source: '502', target: '1142' },
    { source: '172.16.0.1', target: '172.16.0.12' },
    { source: '00:a0:45:12:ef:51', target: '00:07:92:00:72:20' },
    { source: '172.16.97.10', target: '1791' },
    { source: '1791', target: '20547' },
    { source: '20547', target: '1791' },
    { source: '172.16.0.15', target: '1075' },
    { source: '1075', target: '8100' },
    { source: '8100', target: '1075' },
    { source: '172.16.0.1', target: '1025' },
    { source: '172.16.0.11', target: '34964' },
    { source: '00:a0:45:42:9c:52', target: '172.16.0.11' },
    { source: '1025', target: '34964' },
    { source: '00:a0:45:42:9c:52', target: '172.16.0.11' },
    { source: '172.16.0.1', target: '172.16.0.11' },
    { source: '00:a0:45:12:ef:51', target: '00:a0:45:42:9c:52' },
    { source: '172.16.0.11', target: '1024' },
    { source: '1024', target: '1025' },
    { source: '172.16.0.11', target: '172.16.0.1' },
    { source: '00:a0:45:42:9c:52', target: '00:a0:45:12:ef:51' },
    { source: '172.16.0.12', target: '34964' },
    { source: '172.16.0.12', target: '9011' },
    { source: '9011', target: '1025' },
    { source: '172.16.0.3', target: '34964' },
    { source: '00:01:05:09:11:35', target: '172.16.0.3' },
    { source: '00:01:05:09:11:35', target: '172.16.0.3' },
    { source: '172.16.0.1', target: '172.16.0.3' },
    { source: '00:a0:45:12:ef:51', target: '00:01:05:09:11:35' },
    { source: '1025', target: '1024' },
    { source: '172.16.0.3', target: '50000' },
    { source: '50000', target: '1025' },
    { source: '172.16.0.3', target: '172.16.0.1' },
    { source: '00:01:05:09:11:35', target: '00:a0:45:12:ef:51' },
    { source: '1025', target: '9011' },
    { source: '172.16.0.6', target: '34964' },
    { source: '08:00:06:6c:03:73', target: '172.16.0.6' },
    { source: '08:00:06:6c:03:73', target: '172.16.0.6' },
    { source: '172.16.0.1', target: '172.16.0.6' },
    { source: '00:a0:45:12:ef:51', target: '08:00:06:6c:03:73' },
    { source: '172.16.0.6', target: '1203' },
    { source: '1203', target: '1025' },
    { source: '172.16.0.6', target: '172.16.0.1' },
    { source: '08:00:06:6c:03:73', target: '00:a0:45:12:ef:51' },
    { source: '1025', target: '50000' },
    { source: '172.16.0.7', target: '34964' },
    { source: '00:a0:45:18:d4:23', target: '172.16.0.7' },
    { source: '00:a0:45:18:d4:23', target: '172.16.0.7' },
    { source: '172.16.0.1', target: '172.16.0.7' },
    { source: '00:a0:45:12:ef:51', target: '00:a0:45:18:d4:23' },
    { source: '34964', target: '1025' },
    { source: '172.16.0.7', target: '172.16.0.1' },
    { source: '00:a0:45:18:d4:23', target: '00:a0:45:12:ef:51' },
    { source: '172.16.0.4', target: '34964' },
    { source: '00:a0:45:18:d3:b3', target: '172.16.0.4' },
    { source: '00:a0:45:18:d3:b3', target: '172.16.0.4' },
    { source: '172.16.0.1', target: '172.16.0.4' },
    { source: '00:a0:45:12:ef:51', target: '00:a0:45:18:d3:b3' },
    { source: '1025', target: '1203' },
    { source: '172.16.0.4', target: '172.16.0.1' },
    { source: '00:a0:45:18:d3:b3', target: '00:a0:45:12:ef:51' },
    { source: '172.16.0.9', target: '34964' },
    { source: '00:a0:45:05:2a:0e', target: '172.16.0.9' },
    { source: '00:a0:45:05:2a:0e', target: '172.16.0.9' },
    { source: '172.16.0.1', target: '172.16.0.9' },
    { source: '00:a0:45:12:ef:51', target: '00:a0:45:05:2a:0e' },
    { source: '172.16.0.8', target: '34964' },
    { source: '00:a0:45:07:62:97', target: '172.16.0.8' },
    { source: '00:a0:45:07:62:97', target: '172.16.0.8' },
    { source: '172.16.0.1', target: '172.16.0.8' },
    { source: '00:a0:45:12:ef:51', target: '00:a0:45:07:62:97' },
    { source: '172.16.0.2', target: '34964' },
    { source: '00:30:de:03:b6:1a', target: '172.16.0.2' },
    { source: '00:30:de:03:b6:1a', target: '172.16.0.2' },
    { source: '172.16.0.1', target: '172.16.0.2' },
    { source: '00:a0:45:12:ef:51', target: '00:30:de:03:b6:1a' },
    { source: '172.16.0.2', target: '47923' },
    { source: '47923', target: '1025' },
    { source: '172.16.0.2', target: '172.16.0.1' },
    { source: '00:30:de:03:b6:1a', target: '00:a0:45:12:ef:51' },
    { source: '172.16.0.9', target: '1024' },
    { source: '172.16.0.9', target: '172.16.0.1' },
    { source: '00:a0:45:05:2a:0e', target: '00:a0:45:12:ef:51' },
    { source: '172.16.0.11', target: '1025' },
    { source: '1025', target: '1025' },
    { source: '172.16.0.8', target: '1024' },
    { source: '172.16.0.8', target: '172.16.0.1' },
    { source: '00:a0:45:07:62:97', target: '00:a0:45:12:ef:51' },
    { source: '172.16.0.1', target: '1027' },
    { source: '172.16.0.10', target: '502' },
    { source: '00:0e:8c:93:d5:93', target: '172.16.0.10' },
    { source: '1027', target: '502' },
    { source: '00:0e:8c:93:d5:93', target: '172.16.0.10' },
    { source: '172.16.0.1', target: '172.16.0.10' },
    { source: '00:a0:45:12:ef:51', target: '00:0e:8c:93:d5:93' },
    { source: '172.16.0.9', target: '1025' },
    { source: '502', target: '1027' },
    { source: '172.16.0.10', target: '172.16.0.1' },
    { source: '00:0e:8c:93:d5:93', target: '00:a0:45:12:ef:51' },
    { source: '172.16.0.5', target: '34964' },
    { source: '00:a0:45:19:0c:7b', target: '172.16.0.5' },
    { source: '00:a0:45:19:0c:7b', target: '172.16.0.5' },
    { source: '172.16.0.1', target: '172.16.0.5' },
    { source: '00:a0:45:12:ef:51', target: '00:a0:45:19:0c:7b' },
    { source: '169.254.35.103', target: '137' },
    { source: '169.254.255.255', target: '137' },
    { source: '00:1f:d0:a4:2a:85', target: '169.254.35.103' },
    { source: 'ff:ff:ff:ff:ff:ff', target: '169.254.255.255' },
    { source: '00:1f:d0:a4:2a:85', target: '169.254.35.103' },
    { source: 'ff:ff:ff:ff:ff:ff', target: '169.254.255.255' },
    { source: '169.254.35.103', target: '169.254.255.255' },
    { source: '172.16.0.12', target: '1143' },
    { source: '1143', target: '502' },
    { source: '502', target: '1143' },
    { source: '172.16.0.5', target: '1216' },
    { source: '1025', target: '1216' },
    { source: '172.16.250.59', target: '1962' },
    { source: '20547', target: '1962' },
    { source: '00:a0:45:12:ef:51', target: '00:11:6b:94:09:92' },
    { source: '1962', target: '20547' },
    { source: '00:a0:57:18:59:7e', target: '172.16.23.2' },
    { source: '01:00:5e:00:00:02', target: '224.0.0.2' },
    { source: '172.16.23.2', target: '224.0.0.2' },
  ],
};