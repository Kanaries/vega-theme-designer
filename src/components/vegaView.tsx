import type * as vega from 'vega';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as vegalite from 'vega-lite';
import vegaEmbed, {type VisualizationSpec, type Config, type Result} from 'vega-embed';
import React, {
	useRef, useEffect, useState, type MutableRefObject,
} from 'react';
import style from './vegaView.module.css';

type VegaConfig = {
	spec: VisualizationSpec;
	renderer: vega.Renderers;
	config: Config;
};

function vegaView(props: VegaConfig): JSX.Element {
	const vegaEl
		= useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;

	const hasRenderer = useRef<boolean>(false);
	const isVisible = useRef<boolean>(false);
	const VegaResult = useRef <Record<string, Result>>({});

	const {spec, renderer, config} = props;

	async function renderVega() {
		spec.config = config;
		if (!hasRenderer.current) {
			hasRenderer.current = true;
			VegaResult.current.destory = await vegaEmbed(vegaEl.current, spec, {
				actions: false,
				renderer,
			});
			vegaEl.current.style.width = '';
			vegaEl.current.style.height = '';
			console.log('render------');
		}
	}

	useEffect(() => {
		hasRenderer.current = false;
		if (isVisible.current) {
			void renderVega();
		}

		return () => {
			if (VegaResult.current.destory) {
				VegaResult.current.destory.finalize();
			}
		};
	}, [config]);

	useEffect(() => {
		if (isVisible.current) {
			void renderVega();
		}

		return () => {
			if (VegaResult.current.destory) {
				VegaResult.current.destory.finalize();
			}
		};
	}, [spec, renderer, config]);

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting !== isVisible.current) {
				void renderVega();
				isVisible.current = entries[0].isIntersecting;
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

	const divStyle = {
		width: '100%',
		height: '100%',
	};
	return (
		<div ref={vegaEl} style={divStyle} />
	);
}

export default React.memo(vegaView);
