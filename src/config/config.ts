import {type Config} from 'vega-embed';
import dark from '../vegaConfig/dark.json';
import excel from '../vegaConfig/excel.json';
import fivethirtyeight from '../vegaConfig/fivethirtyeight.json';
import googlecharts from '../vegaConfig/googlecharts.json';
import latimes from '../vegaConfig/latimes.json';
import powerbi from '../vegaConfig/powerbi.json';
import quartz from '../vegaConfig/quartz.json';
import urbaninstitute from '../vegaConfig/urbaninstitute.json';
import vox from '../vegaConfig/vox.json';
import ggplot2 from '../vegaConfig/ggplot2.json';

const configMap: Record<string, Config> = {
	default: {},
	excel: excel as Config,
	dark,
	fivethirtyeight: fivethirtyeight as Config,
	googlecharts: googlecharts as Config,
	latimes: latimes as Config,
	powerbi: powerbi as Config,
	quartz,
	urbaninstitute: urbaninstitute as Config,
	vox: vox as Config,
	ggplot2: ggplot2 as Config,
};

export default configMap;
