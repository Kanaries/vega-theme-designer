import {Loader, loader} from 'vega';
import type {ITheme} from '../store/userStore';

interface VegaUrlConfig {
	config: string;
	preview: string;
	data?: string;
}

export const themeConfigList: Record<string, VegaUrlConfig> = {
	default: {
		config: '/app/theme-designer/vega/vegaConfig/default.json',
		preview: '/app/theme-designer/vega/vegaPreview/default.jpg',
	},
	excel: {
		config: '/app/theme-designer/vega/vegaConfig/excel.json',
		preview: '/app/theme-designer/vega/vegaPreview/excel.jpg',
	},
	dark: {
		config: '/app/theme-designer/vega/vegaConfig/dark.json',
		preview: '/app/theme-designer/vega/vegaPreview/dark.jpg',
	},
	fivethirtyeight: {
		config: '/app/theme-designer/vega/vegaConfig/fivethirtyeight.json',
		preview: '/app/theme-designer/vega/vegaPreview/fivethirtyeight.jpg',
	},
	googlecharts: {
		config: '/app/theme-designer/vega/vegaConfig/googlecharts.json',
		preview: '/app/theme-designer/vega/vegaPreview/googlecharts.jpg',
	},
	latimes: {
		config: '/app/theme-designer/vega/vegaConfig/latimes.json',
		preview: '/app/theme-designer/vega/vegaPreview/latimes.jpg',
	},
	powerbi: {
		config: '/app/theme-designer/vega/vegaConfig/powerbi.json',
		preview: '/app/theme-designer/vega/vegaPreview/powerbi.jpg',
	},
	quartz: {
		config: '/app/theme-designer/vega/vegaConfig/quartz.json',
		preview: '/app/theme-designer/vega/vegaPreview/quartz.jpg',
	},
	urbaninstitute: {
		config: '/app/theme-designer/vega/vegaConfig/urbaninstitute.json',
		preview: '/app/theme-designer/vega/vegaPreview/urbaninstitute.jpg',
	},
	vox: {
		config: '/app/theme-designer/vega/vegaConfig/vox.json',
		preview: '/app/theme-designer/vega/vegaPreview/vox.jpg',
	},
	ggplot2: {
		config: '/app/theme-designer/vega/vegaConfig/ggplot2.json',
		preview: '/app/theme-designer/vega/vegaPreview/ggplot2.jpg',
	},
};

export const schemaUrl: Record<string, string> = {
	simpleBarChart: '/app/theme-designer/vega/vegaSchema/simple-bar-chart.json',
	plotChart: '/app/theme-designer/vega/vegaSchema/plot-chart.json',
	dotChart: '/app/theme-designer/vega/vegaSchema/dot-chart.json',
	stackBarChart: '/app/theme-designer/vega/vegaSchema/horizontal-stacked-bar-chart.json',
	stackAreaChart: '/app/theme-designer/vega/vegaSchema/stack-area-chart.json',
	termographicChart: '/app/theme-designer/vega/vegaSchema/thermographic-chart.json',
	countryMap: '/app/theme-designer/vega/vegaSchema/country-map.json',
};

const vegaLoader: Loader = loader();

const handle: ProxyHandler<Record<string, string | Promise<string>>> = {
	async get(target: Record<string, string>, property: string) {
		const cacheProperty = `_${property}`;
		if (!target[cacheProperty]) {
			target[cacheProperty] = await vegaLoader.load(target[property]);
		}
		return target[cacheProperty];
	},
};

Object.keys(themeConfigList).forEach(key => {
	vegaLoader.load(themeConfigList[key].config).then(data => {
		themeConfigList[key].data = data;
	});
});

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

export const defaultThemes: readonly ITheme[] = Object.keys(getThemeConfigList()).map<ITheme>(
	key => ({
		id: key,
		name: key,
		get config() {
			return themeConfigList[key].data ?? '{}';
		},
		previewSrc: themeConfigList[key].preview,
		isDefault: true,
	}),
);
