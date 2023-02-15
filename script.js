"use strict";

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//Graph dimensions and important data
const url =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const w = 1600;
const h = 600;
const padding = 60;

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
].reverse();

const svg = d3.select("section").append("svg").attr("width", w).attr("height", h);

const legend = svg
  .append("g")
  .attr("transform", `translate(600, ${h - 20})`)
  .attr("id", "legend");

//Method for converting month number to string
const convertMonths = (monthNumber) => {
  switch (monthNumber) {
    case 0:
      return "December";
    case 1:
      return "January";
    case 2:
      return "February";
    case 3:
      return "March";
    case 4:
      return "April";
    case 5:
      return "May";
    case 6:
      return "June";
    case 7:
      return "July";
    case 8:
      return "August";
    case 9:
      return "September";
    case 10:
      return "October";
    case 11:
      return "November";
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
  const baseTemp = data.baseTemperature;
  const belowAvg = data.monthlyVariance.filter((elem) => elem.variance < 0);
  const aboveAvg = data.monthlyVariance.filter((elem) => elem.variance > 0);

  //Obtain lowest and highest years for xScale
  const xMin = d3.min(data.monthlyVariance, (data) => data.year);
  const xMax = d3.max(data.monthlyVariance, (data) => data.year);

  //Lowest and highest months for yScale
  const yMin = d3.min(data.monthlyVariance, (data) => data.month);
  const yMax = d3.max(data.monthlyVariance, (data) => data.month);

  ////Lowest and highest temperatures for legendScale
  const lMin = d3.min(belowAvg, (data) => baseTemp + data.variance);
  const lMax = d3.max(aboveAvg, (data) => baseTemp + data.variance);

  //x, y and legend Scale
  const xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([padding, w - padding]);

  const yScale = d3
    .scaleLinear()
    .domain([yMax + 0.5, yMin - 0.5]) //We are adding some space to top and bottom of yAxis by adding this 0,5
    .range([h - padding, padding]);

  const lScale = d3
    .scaleLinear()
    .domain([lMin, lMax])
    .range([padding, w / 4]);

  //Threshold for legend ticks
  const treshold = d3
    .scaleThreshold()
    //Source for domain: FCC Project -> DevTools -> Sources -> script.js
    .domain(
      ((min, max, numColors) => {
        const array = [];
        const range = (max - min) / numColors;
        const base = min;
        for (let i = 1; i < numColors; i++) {
          array.push(base + i * range);
        }
        return array;
      })(lMin, lMax, colors.length)
    )
    .range(colors);

  //x, y and legend Axis
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat((x) => Math.floor(x))
    .ticks(20);
  //Doing axis like this was pure experiment but it works so its okay
  const yAxis = d3.axisLeft(yScale).tickFormat((x) => convertMonths(x));
  const lAxis = d3
    .axisBottom(lScale)
    .tickValues(treshold.domain())
    .tickFormat(d3.format(".1f")) //creates axis for legend, change their ticks values and format them to fixed precision;
    .tickSize(-30);

  const xAxisG = svg
    .append("g")
    .attr("transform", `translate(0, ${h - (padding + 50)})`)
    .attr("id", "x-axis")
    .call(xAxis)
    .call((g) => g.select(".domain").remove());

  const yAxisG = svg
    .append("g")
    .attr("transform", `translate(${padding}, -50)`)
    .attr("id", "y-axis")
    .call(yAxis)
    .call((g) => g.select(".domain").remove());

  const legendAxis = legend.append("g").call(lAxis);

  legendAxis.select(".domain").remove();

  //Source: https://gist.github.com/mbostock/4573883/
  legend
    .append("g")
    .attr("transform", "translate(0, -30)")
    .selectAll("rect")
    .data(
      treshold.range().map((color) => {
        let d = treshold.invertExtent(color);
        if (d[0] == null) d[0] = lScale.domain()[0];
        if (d[1] == null) d[1] = lScale.domain()[1];
        return d;
      })
    )
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
    .attr("fill", (d) => treshold(d[0]));

  const dataMap = svg.append("g").attr("transform", `translate(0, -70)`);

  //Tooltip methods
  const onMouseOver = (event) => {
    const tooltip = d3.select("#tooltip");

    //Data for tooltip
    const temp = baseTemp;
    const month = event.target.__data__.month;
    const year = event.target.__data__.year;
    const variance = event.target.__data__.variance;

    tooltip
      .style("top", `${event.clientY - 10}px`)
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

  const onMouseOut = () => {
    const tooltip = d3.select("#tooltip")

    tooltip.style("opacity", "0")
  }

  dataMap
    .selectAll("rect")
    .data(data.monthlyVariance)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.year))
    .attr("y", (d) => yScale(d.month))
    .on("mouseover", onMouseOver)//TODO: When height is equal to yAxus tooltip need to be above hovered cell  
    .on("mouseout", onMouseOut)
    .attr("data-month", (d) => d.month)
    .attr("data-year", (d) => d.year)
    .attr("data-temp", (d) => handleTempVariance(baseTemp, d.variance))
    .attr("class", "cell")
    .attr("width", 5)
    .attr("height", 40)//TODO: height equal yScale
    .attr("fill", "navy");

  console.log(data, data.monthlyVariance[0].variance.toFixed(1));
};

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    render(data);
  });
