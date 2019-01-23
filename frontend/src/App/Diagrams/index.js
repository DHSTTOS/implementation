import React, { Component } from "react";
import { observer } from "mobx-react";
import styled from "@emotion/styled";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import { ResponsiveScatterPlot } from "@nivo/scatterplot";

import { appStore } from "@stores";
import { jsonstreams } from "../../../mockdata";
import { formatData } from "@libs";

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  align-self: stretch;
  margin: 0.5rem;
  height: 20rem;
`;

const StyledPaper = styled(Paper)`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  margin: 0.5rem;
`;

const PlotContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  align-self: stretch;
  margin: 0.5rem;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: stretch;
`;

const CenteredTypography = styled(Typography)`
  align-self: center;
`;

@observer
class DiagramsContainer extends Component {
  render() {
    return (
      <Container>
        {appStore.diagramConfigs.length === 0 ? (
          <StyledPaper elevation={1}>
            <CenteredTypography variant="subtitle1" color="textSecondary">
              Please add a diagram
            </CenteredTypography>
          </StyledPaper>
        ) : (
          appStore.diagramConfigs.map(config => (
            <StyledPaper elevation={1} key={config.diagramID}>
              <Diagram config={config} />
            </StyledPaper>
          ))
        )}
      </Container>
    );
  }
}

class Diagram extends Component {
  render() {
    const data = formatData({
      groupName: "L2Protocol",
      x: "SourceMACAddress",
      y: "DestinationMACAddress",
      rawData: jsonstreams,
    });
    console.log(data);

    return (
      <PlotContainer>
        <ResponsiveScatterPlot
          data={data}
          margin={{
            top: 60,
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
          axisTop={null}
          axisRight={null}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "SourceMACAddress",
            legendPosition: "middle",
            legendOffset: 46,
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "DestinationMACAddress",
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
      </PlotContainer>
    );
  }
}

export default DiagramsContainer;
