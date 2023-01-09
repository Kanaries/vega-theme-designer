import { Config } from "vega-embed";
import dark from "../vegaConfig/dark.json";
import excel from "../vegaConfig/excel.json";
import fivethirtyeight from "../vegaConfig/fivethirtyeight.json";
import googlecharts from "../vegaConfig/googlecharts.json";
import latimes from "../vegaConfig/latimes.json";
import powerbi from "../vegaConfig/powerbi.json";
import quartz from "../vegaConfig/quartz.json";
import urbaninstitute from "../vegaConfig/urbaninstitute.json";
import vox from "../vegaConfig/vox.json";
import ggplot2 from "../vegaConfig/ggplot2.json";

const configMap = {
  default: {},
  excel,
  dark,
  fivethirtyeight,
  googlecharts,
  latimes,
  powerbi,
  quartz,
  urbaninstitute,
  vox,
  ggplot2,
} as Record<string, Config>;

export default configMap;
