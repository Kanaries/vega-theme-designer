import {type Renderers} from 'vega';
import React, {
	useRef, useState, useCallback, type MutableRefObject, ReactElement, useEffect,
} from 'react';
import {type Config} from 'vega-embed';
import {ThemeProvider} from '@fluentui/react';
import html2canvas from 'html2canvas';
import style from './App.module.css';
import VegaView from './components/vegaView';
import Editor from './components/Editor';
import {mainTheme} from './theme';
import EditorHeader from './components/editorHeader';
import {schemaUrl} from './utils/loadVegaResource';
import ThemeIndexedDB from './utils/useIndexedDB';
import {addEventListen, removeEventListen} from './utils/utils';
import {DataBaseName, PreViewObjectStoreName} from './config/dbConfig';
import MessageTip from './components/messageTip';
import {useUserStoreProvider} from './store/userStore';

function App(): ReactElement {
	const [rendererValue, setRendererValue] = useState<Renderers>('canvas');
	const [vegaVal, setVegaVal] = useState<Config>({});
	const [vegaContainerBackground, setVegaContainerBackground] =
		useState<string | undefined>(undefined);

	const editorContainer =
		useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;
	const vegaContainer =
		useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;
	const silder =
		useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;
	const currentRenderVega = useRef<number>(0);

	let x: number;

	function editorChange(val: string): void {
		try {
			const vegaThemeVal: Config = JSON.parse(val) as Config;
			setVegaVal(vegaThemeVal);
			setVegaContainerBackground(vegaThemeVal.background as string);
		} catch { /* empty */ }
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

	const editorChangeCallback = useCallback(editorChange, []);

	const vegaContainerStyle: React.CSSProperties = {
		backgroundColor: vegaContainerBackground,
	};

	const preViewToIndexDB = (opt: Record<string, string>) => {
		const {type, themeName} = opt;
		const vegaPreviewDom = vegaContainer.current;
		const windowWidth =
			document.documentElement.clientWidth +
			(vegaPreviewDom.scrollWidth - vegaPreviewDom.offsetWidth) * 2;
		html2canvas(vegaPreviewDom, {
			width: vegaPreviewDom.scrollWidth, // 画布的宽
			height: vegaPreviewDom.scrollHeight, // 画布的高
			windowHeight: vegaPreviewDom.scrollHeight + 86,
			windowWidth,
			scale: 1, // 处理模糊问题
			useCORS: true, // 开启跨域，这个是必须的
		}).then(async data => {
			const dataUrl = data.toDataURL('image/jpeg');
			if (type === 'add') {
				const themeDb = new ThemeIndexedDB(DataBaseName, 1);
				await themeDb.addData(PreViewObjectStoreName, themeName, dataUrl);
			}
			if (type === 'update') {
				const themeDb = new ThemeIndexedDB(DataBaseName, 1);
				await themeDb.updateData(PreViewObjectStoreName, themeName, dataUrl);
			}
		});
	};

	useEffect(() => {
		const eventIndex = addEventListen('vegaCharts2Image', preViewToIndexDB);
		return () => {
			removeEventListen('vegaCharts2Image', eventIndex);
		};
	}, []);

	const UserStoreProvider = useUserStoreProvider();

	return (
		<UserStoreProvider>
			<ThemeProvider theme={mainTheme}>
				<div className={style['app-container']}>
					<MessageTip />
					<EditorHeader
						onRendererChange={rendererChangeHeaderCallback}
						renderer={rendererValue}
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
							style={vegaContainerStyle}
							id="vegaChartsContainer"
						>
							{
								Object.keys(schemaUrl).map(
									(item: string) => (
										<VegaView
											renderNum={currentRenderVega}
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
		</UserStoreProvider>
	);
}

export default App;
