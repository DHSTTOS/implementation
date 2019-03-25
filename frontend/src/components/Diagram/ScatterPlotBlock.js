import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ScatterPlot } from '@nivo/scatterplot';
import {
  selectOriginalRawDatum,
  COLOR_IP,
  COLOR_UDP,
  COLOR_TCP,
  COLOR_PROFI,
  COLOR_ETHER,
  COLOR_TRANSPARENT,
} from '@libs';
import styled from '@emotion/styled';
import { Typography } from '@material-ui/core';
import { appStore } from '@stores';

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

const KeyContainer = styled.div`
  margin-right: 0.5rem;
`;

const colorOf = d => {
  const group = d.serie.id;
  switch (group) {
    case 'Ether':
      return appStore.globalFilters.ether ? COLOR_ETHER : COLOR_TRANSPARENT;
    case 'Profi':
      return appStore.globalFilters.profinet ? COLOR_PROFI : COLOR_TRANSPARENT;
    case 'TCP':
      return appStore.globalFilters.tcp ? COLOR_TCP : COLOR_TRANSPARENT;
    case 'IP':
      return appStore.globalFilters.ip ? COLOR_IP : COLOR_TRANSPARENT;
    case 'UDP':
      return appStore.globalFilters.udp ? COLOR_UDP : COLOR_TRANSPARENT;
  }
};

/**
 * @typedef {object} Props
 * @prop {number} width
 * @prop {number} height
 * @prop {object[]} data
 * @prop {string} x
 * @prop {string} y
 * @prop {number} symbolSize
 *
 * @extends {Component<Props>}
 */
@observer
class ScatterPlotBlock extends Component {
  render() {
    const { width, height, data, x, y, symbolSize } = this.props;
    return (
      <ScatterPlot
        tooltip={d => {
          if (colorOf(d) === COLOR_TRANSPARENT) return;

          const idInSerie = d.id.split('.')[1];
          const realID = d.serie.data[idInSerie].data.id;
          const { Timestamp, _id, ...rawDatum } = selectOriginalRawDatum(
            realID
          );
          const rawDatumKeys = Object.keys(rawDatum);

          return (
            <Column>
              {rawDatumKeys.map(x => {
                if (rawDatum[x] !== '') {
                  return (
                    <Row key={x}>
                      <KeyContainer>
                        <Typography
                          variant="body1"
                          color="textSecondary"
                        >{`${x}: `}</Typography>
                      </KeyContainer>
                      <Typography variant="body1">{rawDatum[x]}</Typography>
                    </Row>
                  );
                }
              })}
            </Column>
          );
        }}
        width={width}
        height={height}
        data={data}
        margin={{
          top: 35,
          right: 90,
          bottom: 70,
          left: 130,
        }}
        colorBy={colorOf}
        symbolSize={d => (colorOf(d) === COLOR_TRANSPARENT ? 0 : symbolSize)}
        xScale={
          x === 'Timestamp'
            ? {
                type: 'time',
                format: '%Q',
                precision: 'millisecond',
              }
            : {
                type: 'point',
              }
        }
        yScale={
          y === 'Timestamp'
            ? {
                type: 'time',
                format: '%Q',
                precision: 'millisecond',
              }
            : {
                type: 'point',
              }
        }
        axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: x,
          legendPosition: 'middle',
          legendOffset: 46,
          format: x === 'Timestamp' ? '%H:%M:%S.%L' : undefined,
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: y,
          legendPosition: 'middle',
          legendOffset: -120,
          format: y === 'Timestamp' ? '%H:%M:%S.%L' : undefined,
        }}
        animate={false}
        legends={[
          {
            anchor: 'bottom-right',
            direction: 'column',
            translateX: 130,
            itemWidth: 100,
            itemHeight: 12,
            itemsSpacing: 5,
            itemTextColor: '#999',
            symbolSize: 12,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#000',
                },
              },
            ],
          },
        ]}
      />
    );
  }
}

export default ScatterPlotBlock;
