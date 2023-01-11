import { Editor } from './components/Editor'
import { Renderers } from 'vega'
import VegaView from './components/vegaView'
import style from './App.module.css'
import React, { useRef, useState } from 'react'
import { Config, VisualizationSpec } from 'vega-embed'
import { ThemeProvider } from '@fluentui/react'
import { mainTheme } from './theme'
import EditorHeader from './components/editorHeader'
import vegaSchema from './config/vega'
import configMap from './config/config'
import ThemeIndexedDB from './utils/useIndexedDB'

const DATABASE_NAME = 'vega_theme_designer'
const OBJECTSTORE_NAME = 'ThemeTable'

function App (): JSX.Element {
    const [editorValue, setEditorValue] = useState<string>('{}')
    const [rendererValue, setRendererValue] = useState<Renderers>('svg')
    const [vegaVal, setVegaVal] = useState<Config>({})

    const editorContainer = useRef<HTMLDivElement | null>(null)
    const vegaContainer = useRef<HTMLDivElement | null>(null)
    const silder = useRef<HTMLDivElement | null>(null)

    let x: number, y: number

    function editorChange (val: string, vegaThemeVal: Config): void {
        try {
            vegaThemeVal = JSON.parse(val)
            setEditorValue(val)
            setVegaVal(vegaThemeVal)
        } catch {
            void (0)
        }
    }

    async function getTheme (themeName: string): Promise<void> {
        const themeDB = new ThemeIndexedDB(DATABASE_NAME, 1)
        await themeDB.open()
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const result: Record<string, string> | undefined = await themeDB.getValue(OBJECTSTORE_NAME, themeName)
        themeDB.close()
        ;(result != null) ? setEditorValue(result.value) : setEditorValue(JSON.stringify(configMap[themeName], null, 4))
    }

    function onThemeChange (val: string): void {
        void getTheme(val)
    }

    const fn = function (e: MouseEvent): void {
        if (silder.current != null && editorContainer.current != null && vegaContainer.current != null) {
            editorContainer.current.style.width = String(e.clientX - x) + 'px'
            vegaContainer.current.style.width = String(document.documentElement.clientWidth - e.clientX + x) + 'px'
        }
    }

    function sliderDown (e: React.MouseEvent<HTMLElement>): void {
        x = e.nativeEvent.offsetX
        y = e.nativeEvent.offsetY
        window.addEventListener('mousemove', fn)
    }
    window.addEventListener('mouseup', function () {
        window.removeEventListener('mousemove', fn)
    })

    return (
        <ThemeProvider theme={mainTheme}>
            <div className={style['app-container']}>
                <EditorHeader
                    onThemeChange={onThemeChange}
                    onRendererChange={(val: Renderers) => { setRendererValue(val) }}
                    editorVal={editorValue}
                />
                <div className={style['design-container']}>
                    <div ref={editorContainer} className={style['editor-container']}>
                        <Editor
                            onChange={(val) => { editorChange(val, vegaVal) }}
                            value={editorValue}
                            containerEl={editorContainer}
                        />
                    </div>
                    <div className={style.resizer} onMouseDown={sliderDown} ref={silder}></div>
                    <div className={style['charts-container']} ref={vegaContainer}>
                        {
                            vegaSchema.map((item: VisualizationSpec, index: number) =>
                                <VegaView key={index} spec={item} renderer={rendererValue} config={vegaVal}/>
                            )
                        }
                    </div>
                </div>
            </div>
        </ThemeProvider>
    )
}

export default App
