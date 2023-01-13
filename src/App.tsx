import {type Renderers} from 'vega';
import React, {
	useRef, useState, useCallback, type MutableRefObject,
} from 'react';
import {type Config} from 'vega-embed';
import {ThemeProvider} from '@fluentui/react';
import style from './App.module.css';
import VegaView from './components/vegaView';
import Editor from './components/Editor';
import {mainTheme} from './theme';
import EditorHeader from './components/editorHeader';
import vegaSchema from './config/vega';
import configMap from './config/config';
import ThemeIndexedDB from './utils/useIndexedDB';

const DataBaseName = 'vega_theme_designer';
const ObjectStoreName = 'ThemeTable';

function App(): JSX.Element {
	const [editorValue, setEditorValue] = useState<string>('{}');
	const [rendererValue, setRendererValue] = useState<Renderers>('canvas');
	const [vegaVal, setVegaVal] = useState<Config>({});

	const editorContainer
		= useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;
	const vegaContainer
		= useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;
	const silder
		= useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;

	let x: number;

	function editorChange(val: string): void {
		try {
			const vegaThemeVal: Config = JSON.parse(val) as Config;
			setVegaVal(vegaThemeVal);
		} catch {
			void (0);
		}
	}

	async function getTheme(themeName: string): Promise<void> {
		const themeDb = new ThemeIndexedDB(DataBaseName, 1);
		await themeDb.open();
		const result: Record<string, string> | undefined
			= await themeDb.getValue(ObjectStoreName, themeName);
		themeDb.close();

		if (result) {
			setEditorValue(result.value);
		} else {
			setEditorValue(JSON.stringify(configMap[themeName], null, 4));
		}
	}

	function onThemeChange(val: string): void {
		void getTheme(val);
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

	window.addEventListener('mouseup', () => {
		window.removeEventListener('mousemove', fn);
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
					editorVal={editorValue}
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
							value={editorValue}
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
							Object.keys(vegaSchema).map(
								(item: string) => (
									<VegaView
										config={vegaVal}
										key={item}
										renderer={rendererValue}
										spec={vegaSchema[item]}
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
