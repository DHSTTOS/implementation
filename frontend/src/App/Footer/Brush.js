import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import * as d3 from 'd3';
import { dataStore } from '@stores';

const Container = styled.div`
  bottom: 0;
  display: flex;
  height: 5rem;
  width: 65rem;
  /* TODO: you can remove the background color now */
  background-color: pink;
`;

export default class Brush extends PureComponent {
  brush = React.createRef();

  componentDidMount = () => {
    // DO NOT TOUCH THE CODE ABOVE (except importing and change the bg color ofc)

    // use `this.brush.current` as the reference to the root node and that's it
    // reference dataStore or appStore as needed, there shouldn't be any problems

    // Mock-up:
    // dataStore.
    //wsutils.getStartEnd(appStore.sourceSelected);

    //let main = d3.select(this.brush.current)
    //  .append('span')
    //  .text('Hole punched, D3 plugged in. :)');

    let main = d3.select(this.brush.current);

    let width = 700;
    let height = 100;

    let dataEndpoints = dataStore.endPoints; // the range of the whole datastream
    if (!dataEndpoints) {
      dataEndpoints = [0, 1000];
    }
    let curRange = [0, 100]; // the current range of the brush/slider

    let xCurScale = d3
      .scaleLinear()
      .domain([curRange[0], curRange[1]])
      .range([0, width]);
    let xTotalScale = d3
      .scaleLinear()
      .domain([dataEndpoints[0], dataEndpoints[1]])
      .range([0, width]);

    //let xAxis = d3.axisBottom().scale(xTotalScale).orient("bottom");
    let xAxis = d3
      .axisBottom(xTotalScale)
      //.ticks(100)
      .tickSize(5);
    //.tickFormat(function(d){ return d.x;})
    //.tickFormat('f')
    let xAxis2 = d3
      .axisTop(xCurScale)
      //.ticks(100)
      .tickSize(10);
    //.tickFormat(function(d){ return d.x;})
    //.tickFormat('f')
    // from example code:

    //var svg = d3.select("body").append("svg").attr("width",width).attr("height",height);
    let svg = main
      .append('svg')
      .attr('width', width)
      .attr('height', height);
    //let svg = main;

    let focus = svg
      .append('g')
      .attr('class', 'focus')
      .attr('transform', 'translate(' + 10 + ',' + 10 + ')');
    // does this shift the axis too far right?

    focus
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + 50 + ')')
      .call(xAxis);

    // XXX should we append/use another "g"?
    focus
      .append('g')
      .attr('class', 'x axis2')
      .attr('transform', 'translate(0,' + 15 + ')')
      .call(xAxis2);

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('stroke', 'black');

    let brushD = d3
      .brushX()
      .extent([[0, height / 2], [width, height]])
      .on('start brush', brushed)
      .on('end', brushended);

    svg
      .append('g')
      .attr('class', 'brush')
      .call(brushD);

    let updateCurrentlySelectedData = range => {
      let s = xTotalScale.invert(range[0]);
      let e = xTotalScale.invert(range[1]);
      console.log('setrange: ' + s + ' ' + e);
      //dataStore.currentlySelectedData = dataStore.rawData.slice(s, e);

      let tmpRawData = dataStore.rawData.filter((_, i) => s <= i && i < e);
      console.log(tmpRawData);
      dataStore.currentlySelectedRawData = tmpRawData;
      // TODO: XXX handle updates for other data collections
    };

    function brushed() {
      // console.log( d3.event.selection );
      /*
      let s = d3.event.selection,
          x0 = s[0][0],
          y0 = s[0][1],
          x1 = s[1][0],
          y1 = s[1][1],
          dx = s[1][0] - x0,
          dy = s[1][1] - y0;
  
      console.log("("+x0+","+y0+")-("+x1+","+y1+")");
      */
      //console.log("selected: " + d3.event.selection[0] + " " + d3.event.selection[1]);
      updateCurrentlySelectedData(d3.event.selection);
      //console.log(brushD.extent().call());
      xCurScale.domain(d3.event.selection);
      xAxis2.scale(xCurScale);
      let t = d3.transition().duration(50); // XXX remove completely?
      svg
        .select('.axis2') // XXX was does this select?
        .transition(t)
        .call(xAxis2);
    }

    function brushended() {
      console.log(
        'brushing ended: ' + d3.event.selection[0] + ' ' + d3.event.selection[1]
      );
      //getAvailableCollections(userStore.socket);
      updateCurrentlySelectedData(d3.event.selection);
      //xTotalScale.domain(dataEndpoints).range([0, width]);
      xCurScale.domain(d3.event.selection);
      xAxis2.scale(xCurScale);

      if (!d3.event.selection) {
        console.log('There is no selection');
      }
    }

    // do whatever you want :)

    // DO NOT TOUCH THE CODE BELOW
  };

  render() {
    return (
      <Container>
        <div ref={this.brush} />
      </Container>
    );
  }
}
