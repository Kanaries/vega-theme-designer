import type * as vega from 'vega';
import vegaEmbed, {type VisualizationSpec, type Config, type Result} from 'vega-embed';
import React, {
	useRef, useEffect, type MutableRefObject, ReactElement,
} from 'react';
import {schemaMap, schemaUrl} from '../utils/loadVegaResource';
import {addEventListen, emitEvent, removeEventListen} from '../utils/utils';

type VegaConfig = {
	schemaName: string,
	renderer: vega.Renderers;
	config: Config;
	renderNum: MutableRefObject<number>;
};

function vegaView(props: VegaConfig): ReactElement {
	const vegaEl =
		useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;

	const hasRenderer = useRef<boolean>(false);
	const isVisible = useRef<boolean>(false);
	const VegaResult = useRef <Record<string, Result>>({});

	const {
		schemaName, renderer, config, renderNum,
	} = props;

	async function renderVega(type?: string) {
		if (!hasRenderer.current) {
			hasRenderer.current = true;
			const spec: VisualizationSpec = JSON.parse(await schemaMap[schemaName]);
			spec.config = config;
			VegaResult.current.destory = await vegaEmbed(vegaEl.current, spec, {
				actions: false,
				renderer,
			});
			renderNum.current += 1;
			vegaEl.current.style.width = '';
			vegaEl.current.style.height = '';
			vegaEl.current.style.width = `${vegaEl.current.clientWidth}px`;
			vegaEl.current.style.height = `${vegaEl.current.clientHeight}px`;
		}
		if (type === 'renderAll') {
			if (renderNum.current >= Object.keys(schemaUrl).length) {
				emitEvent('storePreview');
			}
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

		const allRenderId = addEventListen('renderAllVega', () => {
			renderVega('renderAll');
		});

		return () => {
			observer.disconnect();
			if (VegaResult.current.destory) {
				VegaResult.current.destory.finalize();
			}
			removeEventListen('renderAllVega', allRenderId);
		};
	});

	useEffect(() => {
		hasRenderer.current = false;
		renderNum.current = 0;
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
