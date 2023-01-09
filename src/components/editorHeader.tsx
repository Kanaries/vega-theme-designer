import React, { FormEvent, useEffect, useState } from 'react';
import { Dropdown, PrimaryButton, Label, DefaultButton, Modal, TextField, IDropdownOption, IIconProps } from '@fluentui/react';
import style from './editorHeader.module.css'
import { Renderers } from 'vega'
import { downloadJson } from '../utils/download';
import ThemeIndexedDB, {IDBRequestEvent} from '../utils/useIndexedDB'
import ModalStyle from "./modal.module.css"

interface editorHeader {
  onThemeChange?: (val: string) => void;
  onRendererChange?: (val: Renderers) => void;
  editorVal: string;
}

const defaultThemeList = ['default', 'excel', 'dark', 'ggplot2', 'quartz', 'vox', 'fivethirtyeight', 'latimes', 'urbaninstitute', 'googlecharts', 'powerbi']

const rendererOptions = [
  { key: 'canvas', text: 'canvas'},
  { key: 'svg', text: 'svg', selected: true},
]

const DATABASE_NAME = 'vega_theme_designer'
const OBJECTSTORE_NAME = 'ThemeTable'

async function getRestThemeList(currentList: Array<IDropdownOption>, callback: (restList: Array<IDropdownOption>) => void) {
  const callbackFun = function (event: IDBRequestEvent) {
    // 数据库创建或升级的时候会触发
    let db = event.target.result; // 数据库对象
    db.createObjectStore(OBJECTSTORE_NAME, {
      keyPath: "themeName", // 这是主键
    });
  } as (e: Event) => void;
  let themeDB = new ThemeIndexedDB(DATABASE_NAME, 1)
  await themeDB.open(callbackFun)
  const allTheme = await themeDB.getAll(OBJECTSTORE_NAME)
  const restTheme = allTheme.filter(item => {
    return !defaultThemeList.includes(item?.['themeName'])
  })
  callback(restTheme.map(item => {
    return {
      key: item?.['themeName'],
      text: item?.['themeName']
    }
  }) as Array<IDropdownOption>)
}

async function saveTheme(themeName: string, config: string) {
  let themeDB = new ThemeIndexedDB(DATABASE_NAME, 1)
  await themeDB.open()
  await themeDB.putValue(OBJECTSTORE_NAME,themeName,config)
  themeDB.close() 
}

async function savaAs(themeName: string, config: string, onSuccess: () => void, onErr: () => void) {
  let themeDB = new ThemeIndexedDB(DATABASE_NAME, 1)
  await themeDB.open()
  themeDB.addValue(OBJECTSTORE_NAME,themeName,config)
  .then(onSuccess, onErr)
  .finally(() => {themeDB.close()})
}

export default function editorHeader(props: editorHeader) {

  const [themeOptions, setThemeOptions] = useState<Array<IDropdownOption>>([
    ...defaultThemeList.map(item => {
      if(item === 'default') {
        return { key: item, text: item, selected: true}
      }
      return { key: item, text: item}
    })
  ])
  const [modalShow, setModalShow] = useState<boolean>(false)
  const [theme, setTheme] = useState<string>("default")
  const [newTheme, setNewTheme] = useState<string>("")
  const [errMsg, setErrMsg] = useState<string>("")

  useEffect(() => {
    getRestThemeList(
      themeOptions, 
      (restList: Array<IDropdownOption>) => {
        setThemeOptions([...themeOptions, ...restList])
      })
  }, [])

  function themeHasSame() {
    setErrMsg('Theme alread existed')
  }

  function saveAsSuccess() {
    setErrMsg('')
    setModalShow(false)
  }

  function saveAsBtnClick() {
    savaAs(newTheme, props.editorVal, saveAsSuccess, themeHasSame)
  }

  return (
    <div className={style['header-container']}>
        <Label className={style.label}>Theme:</Label>
        <Dropdown 
          options={themeOptions} 
          className={style.dropdown} 
          onChange={(e, opt) => {
            props.onThemeChange && props.onThemeChange(opt?.text!)
            setTheme(opt?.text!)
          }}
        />
        <Label className={style.label}>Renderer:</Label>
        <Dropdown 
          options={rendererOptions} 
          className={style.dropdown} 
          onChange={(e, opt) => {
            props.onRendererChange && props.onRendererChange(opt?.text as Renderers)
          }}
        />
        <DefaultButton className={style.button} onClick={() => downloadJson(props.editorVal, theme)}>Export Theme</DefaultButton>
        <DefaultButton className={style.button} onClick={() => saveTheme(theme, props.editorVal)}>Save Theme</DefaultButton>
        <DefaultButton className={style.button} onClick={() => setModalShow(true)}>Save As</DefaultButton>
        <Modal isOpen={modalShow} containerClassName={ModalStyle.container}>
          <div className={ModalStyle.header}>
            <Label className={ModalStyle['modal-title']}>Please input your theme name:</Label>
          </div>
          <div>
            <TextField 
              label="Theme name" 
              errorMessage={errMsg}
              onChange={(e: FormEvent, val?: string) => {
                setErrMsg('')
                setNewTheme(val!)
              }}
            />
          </div>
          <div className={ModalStyle.footer}>
            <PrimaryButton 
              className={style.button} 
              onClick={saveAsBtnClick}
            >
              Confirm
            </PrimaryButton>
            <DefaultButton className={style.button} onClick={() => setModalShow(false)}>Cancel</DefaultButton>
          </div>
        </Modal>
    </div>
  )
}
