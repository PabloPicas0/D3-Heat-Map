"use strict";

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//Graph dimensions and important data
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const w = 1600;
const h = 600;
const margin = { top: 20, bottom: 80, left: 80, right: 40 };

const innerWidth = w - margin.left - margin.right;
const innerHeight = h - margin.bottom - margin.top;

const colors = [
  "#a50026",
  "#d73027",
  "#f46d43",
  "#fdae61",
  "#fee090",
  "#ffffbf",
  "#e0f3f8",
  "#abd9e9",
  "#74add1",
  "#4575b4",
  "#313695",
];

const svg = d3.select("section").append("svg").attr("width", w).attr("height", h);
const container = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);

//Method for converting month number to string
const convertMonths = (monthNumber) => {
  switch (monthNumber) {
    case 0:
      return "January";
    case 1:
      return "February";
    case 2:
      return "March";
    case 3:
      return "April";
    case 4:
      return "May";
    case 5:
      return "June";
    case 6:
      return "July";
    case 7:
      return "August";
    case 8:
      return "September";
    case 9:
      return "October";
    case 10:
      return "November";
    case 11:
      return "December";
    default:
      return "";
  }
};

const handleTempVariance = (baseTemp, variance) => {
  if (variance < 0) {
    return `${(baseTemp + variance).toFixed(1)}℃`;
  }
  return `${(baseTemp - variance).toFixed(1)}℃`;
};

const render = (data) => {
  data.monthlyVariance.forEach((element) => {
    element.month--;
  });
  //Base temperature
  const { baseTemperature } = data;
  const belowAvg = data.monthlyVariance.filter((elem) => elem.variance < 0);
  const aboveAvg = data.monthlyVariance.filter((elem) => elem.variance > 0);

  //Obtain lowest and highest years for xScale
  const xMin = d3.min(data.monthlyVariance, (data) => data.year);
  const xMax = d3.max(data.monthlyVariance, (data) => data.year);

  //Lowest and highest months for yScale
  const yMin = d3.min(data.monthlyVariance, (data) => data.month);
  const yMax = d3.max(data.monthlyVariance, (data) => data.month);

  ////Lowest and highest temperatures for legendScale
  const lMin = d3.min(belowAvg, (data) => baseTemperature + data.variance);
  const lMax = d3.max(aboveAvg, (data) => baseTemperature + data.variance);

  //Dimensions for cells
  const cellWidth = (innerWidth * 12) / data.monthlyVariance.length;
  const cellHeight = innerHeight / 12;

  //x Scale
  const xScale = d3.scaleLinear().domain([xMin, xMax]).range([margin.left, innerWidth]);

  //y Scale
  const yScale = d3
    .scaleLinear()
    .domain([yMin - 0.5, yMax + 0.5]) //We are adding some space to top and bottom of yAxis by adding this 0,5
    .range([0, innerHeight]);

  //Legend Scale
  const lScale = d3
    .scaleLinear()
    .domain([lMin, lMax])
    .range([margin.right, innerWidth / 4]);

  //We need to get range of values from maximum and minumum temperatures
  const ranges = [];
  const range = lMax - lMin;
  const colorRanges = range / colors.length;
  for (let i = 1; i < colors.length; i++) {
    ranges.push(lMin + i * colorRanges);
  }

  //Legend Scale treshold
  const legendTreshold = d3.scaleThreshold().domain(ranges).range(colors.reverse());

  //x Axis
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat((x) => Math.floor(x))
    .ticks(20);

  //y Axis
  const yAxis = d3.axisLeft(yScale).tickFormat(convertMonths);

  //Legend Axis
  const lAxis = d3
    .axisBottom(lScale)
    .tickValues(legendTreshold.domain())
    .tickFormat(d3.format(".1f")) //creates axis for legend, change their ticks values and format them to fixed precision;
    .tickSize(-30);

  //G element for x Axis
  const xAxisG = container
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .attr("id", "x-axis")
    .call(xAxis)
    .call((g) => g.select(".domain").remove());

  //G element for y Axis
  const yAxisG = container
    .append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .attr("id", "y-axis")
    .call(yAxis)
    .call((g) => g.select(".domain").remove());

  //G element for legend
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(${innerWidth / 2 - 60}, ${h - 10})`);

  //Legend Axis
  legend
    .append("g")
    .call(lAxis)
    .call((g) => g.select(".domain").remove());

  //Source: https://gist.github.com/mbostock/4573883/
  const dataset = legendTreshold.range().map((color) => {
    let d = legendTreshold.invertExtent(color);
    if (d[0] == null) d[0] = lScale.domain()[0];
    if (d[1] == null) d[1] = lScale.domain()[1];
    return d;
  });

  //Legend color ranges
  legend
    .append("g")
    .attr("transform", "translate(0, -30)")
    .selectAll("rect")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("height", 30)
    .attr("x", (d) => lScale(d[0]))
    .attr("width", (d) => {
      if (d[0] < 2.6 || d[1] > 12.8) {
        return lScale(null);
      }
      return lScale(d[1]) - lScale(d[0]);
    })
    .attr("fill", (d) => legendTreshold(d[0]));

  //Method to show data on tooltip
  const onMouseOver = (event) => {
    const tooltip = d3.select("#tooltip");

    //Data for tooltip
    const temp = baseTemperature;
    const { month, year, variance } = event.target.__data__;

    tooltip
      .style("top", `${event.clientY - 30}px`)
      .style("left", `${event.clientX - 10}px`)
      .style("opacity", "0.9")
      .attr("data-year", `${year}`)
      .html(
        `${year} - ${convertMonths(month)} <br> Temp: ${handleTempVariance(
          temp,
          variance
        )} <br> Variance: ${variance.toFixed(1)}`
      );
  };

  //Method for close tooltip
  const onMouseOut = () => {
    const tooltip = d3.select("#tooltip");

    tooltip.style("opacity", "0");
  };

  container
    .selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month) - cellHeight / 2)
    .on("mouseover", onMouseOver)
    .on("mouseout", onMouseOut)
    .attr("data-month", (d) => d.month)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => handleTempVariance(baseTemperature, d.variance))
    .attr("class", "cell")
    .attr("width", cellWidth)
    .attr("height", cellHeight)
    .attr("fill", (d) => {
      return legendTreshold(baseTemperature + d.variance);
    });
};

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    render(data);
  });
