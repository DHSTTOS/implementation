import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Line } from '@nivo/line';

/**
 * @typedef {object} Props
 * @prop {number} width
 * @prop {number} height
 * @prop {object[]} data
 * @prop {string} colors
 * @prop {boolean} enableArea
 * @prop {number} lineWidth
 * @prop {number} areaOpacity
 *
 * @extends {Component<Props>}
 */
@observer
class LineChartBlock extends Component {
  render() {
    const {
      width,
      height,
      data,
      colors,
      enableArea,
      lineWidth,
      areaOpacity,
    } = this.props;

    return (
      <Line
        width={width}
        height={height}
        data={data}
        margin={{
          top: 35,
          right: 135,
          bottom: 70,
          left: 70,
        }}
        colors={colors}
        enableArea={enableArea}
        lineWidth={lineWidth}
        areaOpacity={areaOpacity}
        xScale={{
          type: 'time',
          format: '%Q',
          precision: 'millisecond',
        }}
        yScale={{
          type: 'linear',
          stacked: false,
          min: 'auto',
          max: 'auto',
        }}
        axisBottom={{
          orient: 'bottom',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Time',
          legendPosition: 'middle',
          legendOffset: 46,
          format: '%H:%M:%S.%L',
        }}
        axisLeft={{
          orient: 'left',
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Connections',
          legendPosition: 'middle',
          legendOffset: -50,
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

export default LineChartBlock;
