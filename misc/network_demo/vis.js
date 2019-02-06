// Help with the placement of nodes




//try to integrate zoom in on the node u select or click
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

  // Gets a new location for input key and places them
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
        radius = 200;
        //increment = 360;
        place(k);
      } else if (k.includes('.')) {
        radius = 500;
        // increment = 360;
        place(k);
      } else {
        radius = 800;
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
 // const nodeColors = d3.scale.category20();
  // tooltip used to display details
  const tooltip = Tooltip('vis-tooltip', 230);

  // // charge used in id layout
  const charge = node => -Math.pow(node.radius, 2.0) / 2;

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
    setFilter('all');

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
      .style('fill', function(d){
        if(d.Protocol == "IP"){
          return d3.rgb(12, 67, 199);}
        else if(d.Protocol == "Ether"){
         return d3.rgb(255, 224, 25);
        }else if (d.Protocol == "UDP"){
          return d3.rgb(255, 24, 166)
        }else{
          return d3.rgb(24, 255, 177);
        }
                }) 
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
        thisOpacity = neighboring(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        return thisOpacity;
      });

      link.style('stroke-opacity', function(o) {
        return o.source === d || o.target === d ? 1 : opacity;
      });
    };
  }

  // switches filter option to new filter
  var setFilter = newFilter => (filter = newFilter);

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
      .rgb(24, 255, 139)//(nodeColors(d.id))
      .darker()
      .toString();

  // Mouseover tooltip function
  var showDetails = function(d, i) {
    let content = `<p class="main">id:  ${d.id}</span></p>`;
    content += '<hr class="tooltip-hr">';
    content += `<p class="main">Protocol:  ${d.Protocol}</span></p>`;
     d3.select("body")
    .style("visibility", "visible")
    .style("opacity", 0.9)
    .text(content);
    
    //tooltip.showTooltip(content, d3.event);

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
          alert('There is a connection');
          //return '#007243';
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
    // console.log(d.source.id);
    d3.select("body")
    .append()
    .attr("class", "tooltip")	
    .transition()
    .duration(500)
    .style("opacity", 0.9)
    .html(content);
    console.log(d3.select("body").html(content));
    
  };

  var hideLinkDetails = function(d, i) {
    d3.select("body")
    .style("opacity", 0);
  };
  // Mouseout function
  var hideDetails = function(d, i) {
    d3.select("body")
    .transition()
    .duration(500)
    .style("opacity", 0);
    
    //tooltip.hideTooltip();
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
    const songFile = $(this).val();
    d3.json(`data/${songFile}`, json => myNetwork.updateData(json));
  });
});
