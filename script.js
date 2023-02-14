"use strict";

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

//Graph dimensions and important data
const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const w = 1600;
const h = 900;
const padding = 100;
const baseTemp = 8.66;

const render = (data) => {
    console.log(data)
}

fetch(url)
  .then((response) => response.json())
  .then((data) => {
    render(data);
  });
