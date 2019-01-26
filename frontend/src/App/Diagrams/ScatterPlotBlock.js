import React, { Component } from "react";
import { observer } from "mobx-react";
import { ScatterPlot } from "@nivo/scatterplot";

/**
 * @typedef {object} Props
 * @prop {number} width
 * @prop {number} height
 * @prop {object[]} data
 * @prop {string} x
 * @prop {string} y
 *
 * @extends {Component<Props>}
 */
@observer
class ScatterPlotBlock extends Component {
  render() {
    const { width, height, data, x, y } = this.props;
    return (
      <ScatterPlot
        width={width}
        height={height}
        data={data}
        margin={{
          top: 35,
          right: 140,
          bottom: 70,
          left: 140,
        }}
        xScale={{
          type: "point",
        }}
        yScale={{
          type: "point",
        }}
        axisBottom={{
          orient: "bottom",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: y,
          legendPosition: "middle",
          legendOffset: 46,
        }}
        axisLeft={{
          orient: "left",
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: x,
          legendPosition: "middle",
          legendOffset: -120,
        }}
        legends={[
          {
            anchor: "bottom-right",
            direction: "column",
            translateX: 130,
            itemWidth: 100,
            itemHeight: 12,
            itemsSpacing: 5,
            itemTextColor: "#999",
            symbolSize: 12,
            symbolShape: "circle",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000",
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
