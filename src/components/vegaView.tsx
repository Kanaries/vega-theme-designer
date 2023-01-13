import type * as vega from 'vega';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as vegalite from 'vega-lite';
import vegaEmbed, {type VisualizationSpec, type Config, type Result} from 'vega-embed';
import React, {
	useRef, useEffect, type MutableRefObject,
} from 'react';

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
			vegaEl.current.style.width = `${vegaEl.current.clientWidth}px`;
			vegaEl.current.style.height = `${vegaEl.current.clientHeight}px`;
		}
	}

	useEffect(() => {
		const observer = new IntersectionObserver((entries) => {
			if (entries[0].isIntersecting !== isVisible.current) {
				isVisible.current = entries[0].isIntersecting;
				if (isVisible.current) {
					void renderVega();
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
	}, [config]);

	useEffect(() => {
		if (isVisible.current && !hasRenderer.current) {
			void renderVega();
		}
	}, [spec, renderer, config]);

	const divStyle = {
		width: '100%',
		height: '100%',
	};
	return (
		<div ref={vegaEl} style={divStyle} />
	);
}

export default React.memo(vegaView);
