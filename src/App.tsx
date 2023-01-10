import { Editor } from './components/Editor';
import { Renderers } from 'vega'
import VegaView from './components/vagaView';
import style from './App.module.css';
import { useRef, useState } from 'react';
import { Config, VisualizationSpec } from 'vega-embed';
import { ThemeProvider } from '@fluentui/react';
import { mainTheme } from './theme';
import EditorHeader from './components/editorHeader';
import vegaSchema from './config/vega'
import configMap from "./config/config"
import ThemeIndexedDB from './utils/useIndexedDB'

const DATABASE_NAME = 'vega_theme_designer'
const OBJECTSTORE_NAME = 'ThemeTable'

function App() {
  const [editorValue, setEditorValue] = useState<string>('{}')
  // const [themeValue, setThemeValue] = useState<string>("default")
  const [rendererValue, setRendererValue] = useState<Renderers>("svg")
  const [vegaVal, setVegaVal] = useState<Config>({})

  const editorContainer = useRef<HTMLDivElement | null>(null)

  function editorChange(val: string, vegaThemeVal: Config) {
    try {
      vegaThemeVal = JSON.parse(val)
      setEditorValue(val)
      setVegaVal(vegaThemeVal)
    }catch{
      console.log("出错了")
      void(0)
    }   
  }

  async function getTheme(themeName: string) {
    let themeDB = new ThemeIndexedDB(DATABASE_NAME, 1)
    await themeDB.open()
    const result: Record<string, string> = await themeDB.getValue(OBJECTSTORE_NAME, themeName)
    themeDB.close()
    result ? setEditorValue(result.value) : setEditorValue(JSON.stringify(configMap[themeName], null, 4))

  }

  function onThemeChange(val: string) {
    // setThemeValue(val)
    getTheme(val)
  }

  return (
    <ThemeProvider theme={mainTheme}>
      <div className={style['app-container']}>
        <EditorHeader 
          onThemeChange={onThemeChange} 
          onRendererChange={(val: Renderers) => setRendererValue(val)}
          editorVal={editorValue}
        />
        <div className={style['design-container']} ref={editorContainer}>
          <Editor 
            onChange={(val) => editorChange(val, vegaVal)} 
            value={editorValue} 
            containerEl={editorContainer}
          />
          <div className={style.resizer}></div>
          <div className={style['charts-container']}>
            {
              vegaSchema.map((item: VisualizationSpec, index: number)  => 
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