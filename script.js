"use strict";

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//Graph dimensions and important data
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const w = 1600;
const h = 600;
const padding = 60;

const svg = d3.select("section").append("svg").attr("width", w).attr("height", h);

const render = (data) => {
  //Base temperature
  const baseTemp = data.baseTemperature;

  //Obtain lowest and highest years for xScale
  const xMin = d3.min(data.monthlyVariance, (data) => data.year);
  const xMax = d3.max(data.monthlyVariance, (data) => data.year);

  //Lowest and highest months for yScale
  const yMin = d3.min(data.monthlyVariance, (data) => data.month);
  const yMax = d3.max(data.monthlyVariance, (data) => data.month);

  //x and y Scale
  const xScale = d3
    .scaleLinear()
    .domain([xMin, xMax])
    .range([padding, w - padding]);
  const yScale = d3
    .scaleLinear()
    .domain([yMax + 0.5, yMin - 0.5]) //We are adding some space to top and bottom of yAxis by adding this 0,5
    .range([h - padding, padding]);

    //x and y Axis
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat((x) => Math.floor(x))
    .ticks(20);
    //Doing axis like this was pure experiment but it works so its okay
  const yAxis = d3.axisLeft(yScale).tickFormat((x) => {
    switch (x) {
      case 1:
        return "January";
      case 2:
        return "Febuary";
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
      case 12:
        return "December";
      default:
        return "";
    }
  });

  const xAxisG = svg
    .append("g")
    .attr("transform", `translate(0, ${h - padding})`)
    .attr("id", "x-axis")
    .call(xAxis);

  const yAxisG = svg.append("g").attr("transform", `translate(${padding}, 0)`).attr("id", "y-axis").call(yAxis);

  console.log(data);
};

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    render(data);
  });
