import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import * as d3 from 'd3';
import { appStore, dataStore } from '@stores';
import { autorun } from 'mobx';
import {
  getLocalCollectionData,
  getCollectionGroups,
} from './../../libs/wsutils';

const Container = styled.div`
  bottom: 0;
  display: flex;
  height: 5rem;
  width: 700px;
`;

export default class Brush extends PureComponent {
  brush = React.createRef();
  disposeAutorun = () => {};

  componentDidMount = () => {
    // DO NOT TOUCH THE CODE ABOVE (except importing and change the bg color ofc)

    // use `this.brush.current` as the reference to the root node and that's it
    // reference dataStore or appStore as needed, there shouldn't be any problems

    /* Main Brush Code */

    let main = d3.select(this.brush.current);

    let width = 700;
    let height = 85;
    let maxDisplayable = 2000;
    let margin = [10, 0, 10, 0]; // Margin around brush and axes

    // console.log('start brush : ' + dataStore.rawData.length);
    // console.log(dataStore.endpoints);
    if (dataStore.endpoints.length === 0) {
      dataStore.endpoints = [0, dataStore.rawData.length];
    }
    let dataEndpoints = dataStore.endpoints; // the range of the whole datastream
    // console.log(dataEndpoints);

    let curRangeWidth = dataEndpoints[1] - dataEndpoints[0];
    if (curRangeWidth > maxDisplayable) {
      curRangeWidth = maxDisplayable;
    }
    let curRange = [0, curRangeWidth]; // the current range of the brush/slider; start with a small range

    let xCurrentScale = d3
      .scaleLinear()
      .domain([curRange[0], curRange[1]])
      .range([0, width - margin[0] - margin[2]]);

    let xTotalScale = d3
      .scaleLinear()
      .domain([dataEndpoints[0], dataEndpoints[1]])
      .range([0, width - margin[0] - margin[2]]);

    let cSRD = [0, 0];

    let updateCurrentlySelectedData = range => {
      let start = range[0]; // TODO: instead of filtering, can we use slice()?
      let end = range[1];
      console.log('uCSD: start, end:' + start + ', ' + end);
      console.log('%ccurrentlySelectedRawData', 'color: red; font-weight: bold;')
      console.log([...dataStore.currentlySelectedRawData]);
      console.log('%ccurrentlySelectedFlowrateData', 'color: red; font-weight: bold;')
      console.log([...dataStore.currentlySelectedFlowrateData]);
      // console.log('rawData.length: ' + dataStore.rawData.length);
      // console.log(dataStore.rawData[start]);
      if (dataStore.rawData == undefined || dataStore.rawData.length == 0) {
        return;
      }

      cSRD = dataStore.rawData.filter((x, i) => start <= i && i < end); // TODO: or <= end?
      dataStore.currentlySelectedRawData = cSRD;
      // console.log(
      //   'uCSD: dS.cSRD.length: ' +
      //     dataStore.currentlySelectedRawData.length +
      //     '============'
      // );

      let tStart = dataStore.rawData[start].Timestamp.$date;
      let tEnd = dataStore.rawData[end].Timestamp.$date;

      let tmp = dataStore.flowrateData.filter(
        (x, i) => tStart <= x.date.$date && x.date.$date < tEnd
      );
      dataStore.currentlySelectedFlowrateData = tmp;

      tmp = dataStore.connectionNumberData.filter(
        (x, i) => tStart <= x.date.$date && x.date.$date < tEnd
      );
      dataStore.currentlySelectedConnectionNumberData = tmp;

      // With the current data layout this will hilariously fail:
      //ws.getCollectionGroupData XXX
      /*
      tmp = dataStore.addressesAndLinksData.filter(
        (x, i) => start <= i && i < end
      );
      */
      // XXX currently no brushing/zooming for node-link diagram
      tmp = [...dataStore.addressesAndLinksData];
      dataStore.currentlySelectedAddressAndLinksData = tmp;
    };

    let updateCurrentRange = range => {
      // console.log('updateCR: ' + range[0] + ', ' + range[1]);
      curRange = range;
      updateCurrentlySelectedData(range);
      xCurrentScale.domain(range);
      //xAxisCurrent.scale(xCurrentScale);
      xAxisCurrent.scale(xCurrentScale).tickFormat(tickFormatTimeStamp);
      let t = d3.transition().duration(50); // XXX remove completely?
      svg
        .select('.axisCurrent')
        .transition(t)
        .call(xAxisCurrent);
    };

    let updateTotalRange = range => {
      //console.log('updateCR: ' + range[0] + ', ' + range[1]);
      xTotalScale.domain(range);
      xAxisTotal.scale(xTotalScale).tickFormat(tickFormatTimeStampTotal);
      let t = d3.transition().duration(50); // XXX remove completely?
      svg
        .select('.axisTotal')
        .transition(t)
        .call(xAxisTotal);
    };

    let updateCurrentRangeFromTotal = range => {
      // console.log('updateCRFT: ' + range[0] + ', ' + range[1]);
      updateCurrentRange([
        xTotalScale.invert(range[0]),
        xTotalScale.invert(range[1]),
      ]);
    };

    // console.log('curRange: ' + curRange[0] + ' ' + curRange[1]);
    updateCurrentlySelectedData(curRange);
    // console.log('csd length' + cSRD.length);
    // console.log('rawData length' + dataStore.rawData.length);

    let tickFormatTimeStamp = d => {
      return '0';
    };

    let tickFormatTimeStampTotal = d => {
      //console.log('tFTST: ' + d + ' ' + dataStore.rawData.length);
      if (!dataStore.rawData.length) {
        return d;
      }

      if (appStore.brushConfig.tickstyle) {
        return '' + d;
      }

      let date = new Date(dataStore.rawData[d].Timestamp.$date);

      let lh = ('' + date.getHours()).padStart(2, '0');
      let lm = ('' + date.getMinutes()).padStart(2, '0');
      let ls = ('' + date.getSeconds()).padStart(2, '0');
      let lms = ('' + date.getMilliseconds()).padStart(3, '0');

      let label = lh + ':' + lm + ':' + ls + '.' + lms;
      return label;
    };

    let xAxisCurrent = d3
      .axisBottom(xCurrentScale)
      .ticks(5)
      .tickSize(5)
      .tickFormat(tickFormatTimeStamp);
    //.tickFormat('f')

    let xAxisTotal = d3
      .axisBottom(xTotalScale)
      .ticks(5)
      .tickSize(5)
      .tickFormat(tickFormatTimeStampTotal);

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
      .attr('transform', 'translate(' + margin[0] + ',' + margin[1] + ')');
    let offsetAxisCurrent = 10;
    let offsetAxisTotal = 50;

    focus
      .append('g')
      .attr('class', 'x axisCurrent')
      .attr('transform', 'translate(0,' + offsetAxisCurrent + ')')
      .call(xAxisCurrent);

    focus
      .append('g')
      .attr('class', 'x axisTotal')
      .attr('transform', 'translate(0,' + offsetAxisTotal + ')')
      .call(xAxisTotal);

    // Draw frame around the area for the brush and the axes:
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'none')
      .style('stroke', 'black');

    // TODO initialize brush pos+width to curRange

    let brushD = d3
      .brushX()
      .extent([
        [0, offsetAxisTotal - 20],
        [width - margin[0] - margin[2], offsetAxisTotal + 20],
      ])
      .on('start brush', brushed)
      .on('end', brushended);

    focus
      .append('g')
      .attr('class', 'brush')
      .call(brushD);

    function brushed() {
      // console.log( d3.event.selection );
      if (appStore.brushConfig.smoothScroll) {
        updateCurrentRangeFromTotal(d3.event.selection);
      }
    }

    function brushended() {
      if (!d3.event.selection) {
        console.log('There is no selection');
      }
      console.log(
        'brushing ended: ' + d3.event.selection[0] + ' ' + d3.event.selection[1]
      );
      updateCurrentRangeFromTotal(d3.event.selection);
    }

    this.disposeAutorun = autorun(() => {
      // this block will be rerun whenever the observable targets that you used get updated
      console.warn(
        `Now we have ${dataStore.rawData.length} entries in rawData!`
      );

      // console.log(dataStore.endpoints);
      if (dataStore.endpoints.length === 0) {
        dataStore.endpoints = [0, dataStore.rawData.length];
      }
      // console.log('');
      let dataEndpoints = dataStore.endpoints; // the range of the whole datastream
      // console.log(dataEndpoints);

      updateCurrentlySelectedData(curRange);

      tickFormatTimeStamp = d => {
        //console.log('tickFormatTimeStamp called, d:' + d + ' cr0 ' + curRange[0
        //console.log("tickF: " + d + ": " + cSRD[d]);

        //console.log('autorun.tickFormatTimeStamp:');
        if (appStore.brushConfig.tickstyle) {
          return '' + d;
        }

        let offset = Math.floor(d - curRange[0]);
        //console.log('cSRD.length: ' + cSRD.length + ' ' + curRange[0]);
        //console.log(curRange);
        //return d + '_' + (d-curRange[0]);
        //console.log('offset: ' + offset);
        // XXX workaround, if offset is too big:
        let tmpOffset = Math.min(offset, cSRD.length - 1);
        if (tmpOffset == -1) {
          return 'n/a';
        }
        let date = new Date(cSRD[tmpOffset].Timestamp.$date);

        let lh = ('' + date.getHours()).padStart(2, '0');
        let lm = ('' + date.getMinutes()).padStart(2, '0');
        let ls = ('' + date.getSeconds()).padStart(2, '0');
        let lms = ('' + date.getMilliseconds()).padStart(3, '0');

        let label = lh + ':' + lm + ':' + ls + '.' + lms;
        return label;
      };

      updateTotalRange(dataEndpoints);

      updateCurrentRange(curRange);

      // So you might wanna write a function which "handles" updating the ticks etc
    });

    // do whatever you want :)

    // DO NOT TOUCH THE CODE BELOW
  };

  componentWillUnmount = () => {
    this.disposeAutorun();
    this.brush.current.remove();
  };

  render() {
    return (
      <Container>
        <div ref={this.brush} />
      </Container>
    );
  }
}
