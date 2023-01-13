import {Loader, loader} from 'vega';

export const configUrl: Record<string, string> = {
	default: '/vega/vegaConfig/default.json',
	excel: '/vega/vegaConfig/excel.json',
	dark: '/vega/vegaConfig/dark.json',
	fivethirtyeight: '/vega/vegaConfig/fivethirtyeight.json',
	googlecharts: '/vega/vegaConfig/googlecharts.json',
	latimes: '/vega/vegaConfig/latimes.json',
	powerbi: '/vega/vegaConfig/powerbi.json',
	quartz: '/vega/vegaConfig/quartz.json',
	urbaninstitute: '/vega/vegaConfig/urbaninstitute.json',
	vox: '/vega/vegaConfig/vox.json',
	ggplot2: '/vega/vegaConfig/ggplot2.json',
};

export const schemaUrl: Record<string, string> = {
	simpleBarChart: '/vega/vegaSchema/simple-bar-chart.json',
	plotChart: '/vega/vegaSchema/plot-chart.json',
	dotChart: '/vega/vegaSchema/dot-chart.json',
	stackBarChart: '/vega/vegaSchema/horizontal-stacked-bar-chart.json',
	stackAreaChart: '/vega/vegaSchema/stack-area-chart.json',
	termographicChart: '/vega/vegaSchema/thermographic-chart.json',
	countryMap: '/vega/vegaSchema/country-map.json',
};

const vegaLoader: Loader = loader();

const handle: ProxyHandler<Record<string, string>> = {
	async get(target: Record<string, string>, property: string) {
		const cacheProperty = `_${property}`;
		if (!target[cacheProperty]) {
			target[cacheProperty] = await vegaLoader.load(target[property]);
		}
		return target[cacheProperty];
	},
};

export const schemaMap = new Proxy({...schemaUrl}, handle);

export const configMap = new Proxy({...configUrl}, handle);
