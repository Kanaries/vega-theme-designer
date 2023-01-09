import simpleBarChart from "../vegaSchema/simple-bar-chart.json";
import plotChart from "../vegaSchema/plot-chart.json";
import dotChart from "../vegaSchema/dot-chart.json";
import stackBarChart from "../vegaSchema/horizontal-stacked-bar-chart.json";
import stackAreaChart from "../vegaSchema/stack-area-chart.json";
import termographicChart from "../vegaSchema/thermographic-chart.json";
import countryMap from "../vegaSchema/country-map.json";

import { VisualizationSpec } from "vega-embed";

const schema = [
  simpleBarChart,
  plotChart,
  dotChart,
  stackBarChart,
  stackAreaChart,
  termographicChart,
  countryMap,
] as Array<VisualizationSpec>;

export default schema;
