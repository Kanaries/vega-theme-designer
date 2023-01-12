import type * as vega from 'vega';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as vegalite from 'vega-lite';
import vegaEmbed, {type VisualizationSpec, type Config, type Result} from 'vega-embed';
import React, {useRef, useEffect, type MutableRefObject} from 'react';

type VegaConfig = {
	spec: VisualizationSpec;
	renderer: vega.Renderers;
	config: Config;
};

export default function vegaView(props: VegaConfig): JSX.Element {
	console.log('vega');
	const vegaEl
		= useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;

	const {spec, renderer, config} = props;
	useEffect(() => {
		spec.config = config;
		let vegaDestory: Result | undefined;
		void (async () => {
			if (vegaEl.current) {
				vegaDestory = await vegaEmbed(vegaEl.current, spec, {
					actions: false,
					renderer,
				});
			}
		})();

		return () => {
			if (vegaDestory) {
				vegaDestory.finalize();
			}
		};
	}, [spec, renderer, config]);
	return (
		<div ref={vegaEl} />
	);
}
