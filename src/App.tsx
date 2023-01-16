import {type Renderers} from 'vega';
import React, {
	useRef, useState, useCallback, type MutableRefObject, ReactElement, useEffect,
} from 'react';
import {type Config} from 'vega-embed';
import {ThemeProvider} from '@fluentui/react';
import style from './App.module.css';
import VegaView from './components/vegaView';
import Editor from './components/Editor';
import {mainTheme} from './theme';
import EditorHeader from './components/editorHeader';
import {configMap, schemaUrl} from './utils/loadVegaResource';
import ThemeIndexedDB from './utils/useIndexedDB';
import {setEditorValue} from './components/editorValue';
import {emitEvent} from './utils/utils';

const DataBaseName = 'vega_theme_designer';
const ObjectStoreName = 'ThemeTable';

function App(): ReactElement {
	const [rendererValue, setRendererValue] = useState<Renderers>('canvas');
	const [vegaVal, setVegaVal] = useState<Config>({});

	const editorContainer =
		useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;
	const vegaContainer =
		useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;
	const silder =
		useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;

	let x: number;

	function editorChange(val: string): void {
		try {
			const vegaThemeVal: Config = JSON.parse(val) as Config;
			setVegaVal(vegaThemeVal);
		} catch { /* empty */ }
	}

	async function getTheme(themeName: string): Promise<void> {
		const themeDb = new ThemeIndexedDB(DataBaseName, 1);
		await themeDb.open();
		const result: Record<string, string> | undefined =
			await themeDb.getValue(ObjectStoreName, themeName);
		themeDb.close();

		if (result) {
			setEditorValue(result.value);
			emitEvent('editorChange', {
				val: result.value,
			});
		} else {
			// const config: Config = await configMap[themeName];
			// const value = JSON.stringify(configMap[themeName], null, 4);
			const value = await configMap[themeName];
			setEditorValue(value);
			emitEvent('editorChange', {
				val: value,
			});
		}
	}

	function onThemeChange(val: string): void {
		getTheme(val);
	}

	const fn = function (e: MouseEvent): void {
		if (silder.current && editorContainer.current && vegaContainer.current) {
			editorContainer.current.style.width = `${String(e.clientX - x)}px`;
			vegaContainer.current.style.width = `${String(document.documentElement.clientWidth - e.clientX + x)}px`;
		}
	};

	function sliderDown(e: React.MouseEvent<HTMLElement>): void {
		x = e.nativeEvent.offsetX;
		window.addEventListener('mousemove', fn);
	}

	useEffect(() => {
		const mouseupCb = () => {
			window.removeEventListener('mousemove', fn);
		};
		window.addEventListener('mouseup', mouseupCb);

		return () => {
			window.removeEventListener('mouseup', mouseupCb);
		};
	});

	const rendererChangeHeaderCallback = useCallback((val: Renderers) => {
		setRendererValue(val);
	}, []);

	const themeChangeHeaderCallback = useCallback(onThemeChange, []);

	const editorChangeCallback = useCallback(editorChange, []);

	return (
		<ThemeProvider theme={mainTheme}>
			<div className={style['app-container']}>
				<EditorHeader
					onRendererChange={rendererChangeHeaderCallback}
					onThemeChange={themeChangeHeaderCallback}
				/>

				<div className={style['design-container']}>
					<div
						className={style['editor-container']}
						ref={editorContainer}
					>
						<Editor
							containerEl={editorContainer}
							onChange={editorChangeCallback}
						/>
					</div>

					<div
						className={style.resizer}
						onMouseDown={sliderDown}
						ref={silder}
					/>

					<div
						className={style['charts-container']}
						ref={vegaContainer}
					>
						{
							Object.keys(schemaUrl).map(
								(item: string) => (
									<VegaView
										config={vegaVal}
										key={item}
										renderer={rendererValue}
										schemaName={item}
									/>
								),
							)
						}
					</div>
				</div>
			</div>
		</ThemeProvider>
	);
}

export default App;
