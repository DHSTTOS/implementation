import React, { PureComponent } from 'react';
import styled from '@emotion/styled';
import * as d3 from 'd3';
import { appStore, dataStore } from '@stores';
import { autorun } from 'mobx';

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

    /* Main Brush Code
     *
     * Naming scheme: "total" refers to the whole range of the collection
     * in the db, it is the domain of the lower brush/slider
     * "section" is the range selected on the total-slider; the domain
     * of the upper brush/slider is set to to this.
     * "current" is the range selected on the section-slider; this is
     * the data range sent to the diagrams.
     */

    let main = d3.select(this.brush.current);

    let width = 700;
    let height = 85;
    let maxDisplayable = 2000;
    let margin = [10, 0, 10, 0]; // Margin around brush area: [left, top, right, bottom]

    console.log('start brush : ' + dataStore.rawData.length);
    console.log(dataStore.endpoints);
    if (dataStore.endpoints.length === 0) {
      dataStore.endpoints = [0, dataStore.rawData.length];
    }
    console.log('');
    let totalRange = dataStore.endpoints;
    console.log(totalRange);

    let sectionRange = [0, Math.min(totalRange[1], maxDisplayable)];

    let curRangeWidth = sectionRange[1] - sectionRange[0];
    let curRange = [0, curRangeWidth];

    let xSectionScale = d3
      .scaleLinear()
      .domain(sectionRange)
      .range([0, width - margin[0] - margin[2]]);

    let xTotalScale = d3
      .scaleLinear()
      .domain(totalRange)
      .range([0, width - margin[0] - margin[2]]);

    let cSRD = [0, 0]; // range of currentlySelectedRawData

    /*
     * Copy the selected data ranges from rawData and "aggregated data"-
     * fields to their respective "currentlySelected<name>" field.
     * (This triggers the observing diagrams to display the new data.)
     *
     * @param {number[]} range
     */
    let updateCurrentlySelectedData = range => {
      let start = range[0];
      let end = range[1];

      // TODO: instead of filtering, can we use slice()?
      cSRD = dataStore.rawData.filter(
        (x, i) => start <= i && i < end // TODO: or <= end?
      );
      dataStore.currentlySelectedRawData = cSRD;

      let tmp = dataStore.flowrateData.filter((x, i) => start <= i && i < end);
      dataStore.currentlySelectedFlowrateData = tmp;

      tmp = dataStore.connectionNumberData.filter(
        (x, i) => start <= i && i < end
      );
      dataStore.currentlySelectedConnectionNumberData = tmp;

      // With the current data layout this will hilariously fail:
      tmp = dataStore.addressesAndLinksData.filter(
        (x, i) => start <= i && i < end
      );
      dataStore.currentlySelectedAddressAndLinksData = tmp;
    };

    let updateCurrentRange = range => {
      //console.log('updateCR: ' + range[0] + ', ' + range[1]);
      curRange = range;
      updateCurrentlySelectedData(range);
      /*
      xSectionScale.domain(range);
      //xAxisSection.scale(xSectionScale);
      xAxisSection.scale(xSectionScale).tickFormat(tickFormatTimeStamp);
      let t = d3.transition().duration(50); // XXX remove completely?
      svg.select('.axisSection').call(xAxisSection);
      */
    };

    let updateSectionRange = range => {
      //console.log('updateSR: ' + range[0] + ', ' + range[1]);
      sectionRange = range;
      //updateCurrentlySelectedData(range);
      xSectionScale.domain(range);
      //xAxisSection.scale(xSectionScale);
      xAxisSection.scale(xSectionScale).tickFormat(tickFormatTimeStamp);
      svg.select('.axisSection').call(xAxisSection);
    };

    let updateTotalRange = range => {
      //console.log('updateCR: ' + range[0] + ', ' + range[1]);
      xTotalScale.domain(range);
      xAxisTotal.scale(xTotalScale).tickFormat(tickFormatTimeStampTotal);
      svg.select('.axisTotal').call(xAxisTotal);
    };

    let updateCurrentRangeFromSection = range => {
      //console.log('updateCRFT: ' + range[0] + ', ' + range[1]);
      updateCurrentRange([
        xSectionScale.invert(range[0]),
        xSectionScale.invert(range[1]),
      ]);
    };

    let updateSectionRangeFromTotal = range => {
      //console.log('updateCRFT: ' + range[0] + ', ' + range[1]);
      updateSectionRange([
        xTotalScale.invert(range[0]),
        xTotalScale.invert(range[1]),
      ]);
    };

    console.log('curRange: ' + curRange[0] + ' ' + curRange[1]);
    updateCurrentlySelectedData(curRange);
    console.log('csd length' + cSRD.length);
    console.log('rawData length' + dataStore.rawData.length);

    let tickFormatTimeStamp = d => {
      return '0';
    };

    let tickFormatTimeStampTotal = d => {
      //console.log('tFTST: ' + d + ' ' + dataStore.rawData.length);
      if (!dataStore.rawData.length) {
        return d;
      }
      let date = new Date(dataStore.rawData[d].Timestamp.$date);

      let lh = ('' + date.getHours()).padStart(2, '0');
      let lm = ('' + date.getMinutes()).padStart(2, '0');
      let ls = ('' + date.getSeconds()).padStart(2, '0');
      let lms = ('' + date.getMilliseconds()).padStart(3, '0');

      let label = '' + d + '_' + lh + ':' + lm + ':' + ls + '.' + lms;
      return label;
    };

    let xAxisSection = d3
      .axisBottom(xSectionScale)
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
    let offsetAxisSection = 10;
    let offsetAxisTotal = 50;

    focus
      .append('g')
      .attr('class', 'x axisSection')
      .attr('transform', 'translate(0,' + offsetAxisSection + ')')
      .call(xAxisSection);

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

    let brushCur = d3
      .brushX()
      .extent([
        [0, offsetAxisSection - 20],
        [width - margin[0] - margin[2], offsetAxisSection + 20],
      ])
      .on('start brush', brushedCur)
      .on('end', brushendedCur);

    focus
      .append('g')
      .attr('class', 'brush')
      .call(brushCur);

    function brushed() {
      // console.log( d3.event.selection );
      if (appStore.brushConfig.smoothScroll) {
        updateSectionRangeFromTotal(d3.event.selection);
      }
    }

    function brushended() {
      if (!d3.event.selection) {
        console.log('There is no selection');
      }
      console.log(
        'brushing ended: ' + d3.event.selection[0] + ' ' + d3.event.selection[1]
      );
      updateSectionRangeFromTotal(d3.event.selection);
    }

    function brushedCur() {
      // console.log( d3.event.selection );
      if (appStore.brushConfig.smoothScroll) {
        updateCurrentRangeFromSection(d3.event.selection);
      }
    }

    function brushendedCur() {
      if (!d3.event.selection) {
        console.log('There is no selection');
      }
      console.log(
        'brushingCur ended: ' +
          d3.event.selection[0] +
          ' ' +
          d3.event.selection[1]
      );
      updateCurrentRangeFromSection(d3.event.selection);
    }

    this.disposeAutorun = autorun(() => {
      // this block will be rerun whenever the observable targets that you used get updated
      console.warn(
        `Now we have ${dataStore.rawData.length} entries in rawData!`
      );

      console.log(dataStore.endpoints);
      if (dataStore.endpoints.length === 0) {
        dataStore.endpoints = [0, dataStore.rawData.length];
      }
      console.log('');
      let totalRange = dataStore.endpoints; // the range of the whole datastream
      console.log(totalRange);

      updateCurrentlySelectedData(curRange);

      tickFormatTimeStamp = d => {
        //console.log('tickFormatTimeStamp called, d:' + d + ' cr0 ' + curRange[0
        //console.log("tickF: " + d + ": " + cSRD[d]);

        //console.log('autorun.tickFormatTimeStamp:');
        if (appStore.brushConfig.tickstyle) {
          return '' + d;
        }

        console.log('d: ' + d + ' curRange: ' + curRange[0]);
        let offset = Math.floor(d - curRange[0]);
        //console.log('cSRD.length: ' + cSRD.length + ' ' + curRange[0]);
        //console.log(curRange);
        //return d + '_' + (d-curRange[0]);
        //console.log('offset: ' + offset);
        console.log('offset: ' + offset + ' cSRD: ');
        console.log(cSRD);
        let date = new Date(cSRD[offset].Timestamp.$date);

        let lh = ('' + date.getHours()).padStart(2, '0');
        let lm = ('' + date.getMinutes()).padStart(2, '0');
        let ls = ('' + date.getSeconds()).padStart(2, '0');
        let lms = ('' + date.getMilliseconds()).padStart(3, '0');

        let label = lh + ':' + lm + ':' + ls + '.' + lms;
        return label;
      };

      updateTotalRange(totalRange);
      updateSectionRange(curRange);
      //updateCurrentRange(curRange);  // TODO

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
