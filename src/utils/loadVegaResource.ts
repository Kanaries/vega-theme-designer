import {Loader, loader} from 'vega';

interface vegaUrlConfig {
	config: string;
	preview: string;
}

export const themeConfigList: Record<string, vegaUrlConfig> = {
	default: {
		config: '/vega/vegaConfig/default.json',
		preview: '/vega/vegaPreview/default.jpg',
	},
	excel: {
		config: '/vega/vegaConfig/excel.json',
		preview: '/vega/vegaPreview/excel.jpg',
	},
	dark: {
		config: '/vega/vegaConfig/dark.json',
		preview: '/vega/vegaPreview/dark.jpg',
	},
	fivethirtyeight: {
		config: '/vega/vegaConfig/fivethirtyeight.json',
		preview: '/vega/vegaPreview/fivethirtyeight.jpg',
	},
	googlecharts: {
		config: '/vega/vegaConfig/googlecharts.json',
		preview: '/vega/vegaPreview/googlecharts.jpg',
	},
	latimes: {
		config: '/vega/vegaConfig/latimes.json',
		preview: '/vega/vegaPreview/latimes.jpg',
	},
	powerbi: {
		config: '/vega/vegaConfig/powerbi.json',
		preview: '/vega/vegaPreview/powerbi.jpg',
	},
	quartz: {
		config: '/vega/vegaConfig/quartz.json',
		preview: '/vega/vegaPreview/quartz.jpg',
	},
	urbaninstitute: {
		config: '/vega/vegaConfig/urbaninstitute.json',
		preview: '/vega/vegaPreview/urbaninstitute.jpg',
	},
	vox: {
		config: '/vega/vegaConfig/vox.json',
		preview: '/vega/vegaPreview/vox.jpg',
	},
	ggplot2: {
		config: '/vega/vegaConfig/ggplot2.json',
		preview: '/vega/vegaPreview/ggplot2.jpg',
	},
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

function getThemeConfigList(): Record<string, string> {
	const configUrl: Record<string, string> = {};
	Object.keys(themeConfigList).forEach(item => {
		configUrl[item] = themeConfigList[item].config;
	});
	return configUrl;
}

const themeConfigUrlList = getThemeConfigList();

export const schemaMap = new Proxy({...schemaUrl}, handle);

export const configMap = new Proxy({...themeConfigUrlList}, handle);
