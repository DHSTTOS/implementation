import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import * as d3 from 'd3';
import { appStore, dataStore } from '@stores';
import { getAvailableCollections } from '@libs';

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

    //wsutils.getStartEnd(appStore.sourceSelected);

    /* Main Brush Code */

    let main = d3.select(this.brush.current);

    let width = 700;
    let height = 100;
    let maxDisplayable = 2000;

    console.log('start brush : ' + dataStore.rawData.length);
    console.log(dataStore.endpoints);
    console.log(dataStore.endpoints.length);
    if (dataStore.endpoints.length === 0) {
      // TODO does dataStore.endpoints have to be shallow?
      dataStore.endpoints = [0, dataStore.rawData.length];
    }
    console.log('bar');
    let dataEndpoints = dataStore.endpoints; // the range of the whole datastream
    console.log(dataEndpoints);

    let curRangeWidth = dataEndpoints[1] - dataEndpoints[0];
    if (curRangeWidth > maxDisplayable) {
      curRangeWidth = maxDisplayable;
    }
    let curRange = [0, curRangeWidth]; // the current range of the brush/slider; start with a small range

    let xCurrentScale = d3
      .scaleLinear()
      .domain([curRange[0], curRange[1]])
      .range([0, width]);
    let xTotalScale = d3
      .scaleLinear()
      .domain([dataEndpoints[0], dataEndpoints[1]])
      .range([0, width]);

    let updateCurrentlySelectedData = range => {
      //console.log('setrange: ' + s + ' ' + e);
      //dataStore.currentlySelectedData = dataStore.rawData.slice(s, e);
      let start = range[0]; // TODO: instead of filtering, can we use slice()?
      let end = range[1];
      console.log('updateCSD: ' + start + ', ' + end);
      let tmpData = dataStore.rawData.filter((x, i) => start <= i && i < end); // TODO: or <= end?
      //console.log(tmpData)
      dataStore.currentlySelectedData = tmpData;
    };

    let updateCurrentRange = range => {
      //console.log('setrange: ' + s + ' ' + e);
      //dataStore.currentlySelectedData = dataStore.rawData.slice(s, e);
      curRange = range;
      updateCurrentlySelectedData(range);
      xCurrentScale.domain(range);
      //xAxisCurrent.scale(xCurrentScale);
      xAxisCurrent.scale(xCurrentScale).tickFormat(tickFormatTimeStamp);
      //console.log(brushD.extent().call());
      let t = d3.transition().duration(50); // XXX remove completely?
      svg
        .select('.axisCurrent') // XXX was does this select?
        .transition(t)
        .call(xAxisCurrent);
    };

    let updateCurrentRangeFromTotal = range => {
      updateCurrentRange([
        xTotalScale.invert(range[0]),
        xTotalScale.invert(range[1]),
      ]);
    };

    console.log('curRange: ' + curRange[0] + ' ' + curRange[1]);
    updateCurrentlySelectedData(curRange);
    console.log('csd length' + dataStore.currentlySelectedData.length);
    console.log('rawData length' + dataStore.rawData.length);

    let tickFormatTimeStamp = d => {
      //console.log('tickFormatTimeStamp called, d:' + d + ' cr0 ' + curRange[0
      //console.log("tickF: " + d + ": " + dataStore.currentlySelectedData[d]);
      let date = new Date(
        dataStore.currentlySelectedData[d - curRange[0]].Timestamp.$date
      );

      let lh = ('' + date.getHours()).padStart(2, '0');
      let lm = ('' + date.getMinutes()).padStart(2, '0');
      let ls = ('' + date.getSeconds()).padStart(2, '0');
      let lms = ('' + date.getMilliseconds()).padStart(3, '0');

      let label = '' + d + '_' + lh + ':' + lm + ':' + ls + '.' + lms;
      return label;
    };

    //let xAxis = d3.axisBottom().scale(xTotalScale).orient("bottom");
    let xAxisCurrent = d3
      .axisBottom(xCurrentScale)
      .ticks(5)
      .tickSize(5)
      .tickFormat(tickFormatTimeStamp);
    //.tickFormat('f')

    let xAxisTotal = d3
      .axisBottom(xTotalScale)
      //.ticks(100)
      .tickSize(10)
      .tickFormat(tickFormatTimeStamp);

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
      .attr('transform', 'translate(' + 0 + ',' + 10 + ')');
    // does this shift the axis too far right?

    focus
      .append('g')
      .attr('class', 'x axisCurrent')
      .attr('transform', 'translate(0,' + 10 + ')')
      .call(xAxisCurrent);

    // XXX should we append/use another "g"?
    focus
      .append('g')
      .attr('class', 'x axisTotal')
      .attr('transform', 'translate(0,' + 50 + ')')
      .call(xAxisTotal);

    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('stroke', 'black');

    // TODO initialize brush pos+width to curRange

    let brushD = d3
      .brushX()
      .extent([[0, height / 2], [width, height]])
      .on('start brush', brushed)
      .on('end', brushended);

    svg
      .append('g')
      .attr('class', 'brush')
      .call(brushD);

    function brushed() {
      // console.log( d3.event.selection );
      updateCurrentRangeFromTotal(d3.event.selection);
    }

    function brushended() {
      console.log(
        'brushing ended: ' + d3.event.selection[0] + ' ' + d3.event.selection[1]
      );
      //getAvailableCollections(userStore.socket);
      updateCurrentRangeFromTotal(d3.event.selection);
      //xTotalScale.domain(dataEndpoints).range([0, width]);
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
