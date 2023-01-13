import type * as vega from 'vega';
import vegaEmbed, {type VisualizationSpec, type Config, type Result} from 'vega-embed';
import React, {
	useRef, useEffect, type MutableRefObject, ReactElement,
} from 'react';
import {schemaMap} from '../utils/loadVegaResource';

type VegaConfig = {
	schemaName: string,
	renderer: vega.Renderers;
	config: Config;
};

function vegaView(props: VegaConfig): ReactElement {
	const vegaEl =
		useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;

	const hasRenderer = useRef<boolean>(false);
	const isVisible = useRef<boolean>(false);
	const VegaResult = useRef <Record<string, Result>>({});

	const {schemaName, renderer, config} = props;

	async function renderVega() {
		const spec: VisualizationSpec = JSON.parse(await schemaMap[schemaName]);
		spec.config = config;
		if (!hasRenderer.current) {
			hasRenderer.current = true;
			VegaResult.current.destory = await vegaEmbed(vegaEl.current, spec, {
				actions: false,
				renderer,
			});
			vegaEl.current.style.width = '';
			vegaEl.current.style.height = '';
			vegaEl.current.style.width = `${vegaEl.current.clientWidth}px`;
			vegaEl.current.style.height = `${vegaEl.current.clientHeight}px`;
		}
	}

	useEffect(() => {
		const observer = new IntersectionObserver(entries => {
			if (entries[0].isIntersecting !== isVisible.current) {
				isVisible.current = entries[0].isIntersecting;
				if (isVisible.current) {
					renderVega();
				}

				observer.disconnect();
			}
		}, {
			rootMargin: '100px',
		});
		observer.observe(vegaEl.current);

		return () => {
			observer.disconnect();
			if (VegaResult.current.destory) {
				VegaResult.current.destory.finalize();
			}
		};
	});

	useEffect(() => {
		hasRenderer.current = false;
		if (isVisible.current) {
			renderVega();
		}
	}, [config, renderer]);

	const divStyle = {
		width: '100%',
		height: '100%',
	};
	return (
		<div ref={vegaEl} style={divStyle} />
	);
}

export default React.memo(vegaView);
