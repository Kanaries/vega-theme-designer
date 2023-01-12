import {type VisualizationSpec} from 'vega-embed';
import simpleBarChart from '../vegaSchema/simple-bar-chart.json';
import plotChart from '../vegaSchema/plot-chart.json';
import dotChart from '../vegaSchema/dot-chart.json';
import stackBarChart from '../vegaSchema/horizontal-stacked-bar-chart.json';
import stackAreaChart from '../vegaSchema/stack-area-chart.json';
import termographicChart from '../vegaSchema/thermographic-chart.json';
import countryMap from '../vegaSchema/country-map.json';

const schema: Record<string, VisualizationSpec> = {
	simpleBarChart: simpleBarChart as VisualizationSpec,
	plotChart: plotChart as VisualizationSpec,
	dotChart: dotChart as VisualizationSpec,
	stackBarChart: stackBarChart as VisualizationSpec,
	stackAreaChart: stackAreaChart as VisualizationSpec,
	termographicChart: termographicChart as VisualizationSpec,
	countryMap: countryMap as VisualizationSpec,
};

export default schema;
