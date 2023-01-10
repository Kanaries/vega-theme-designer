import React, { FormEvent, useEffect, useState } from 'react'
import { Dropdown, PrimaryButton, Label, DefaultButton, Modal, TextField, IDropdownOption } from '@fluentui/react'
import style from './editorHeader.module.css'
import { Renderers } from 'vega'
import { downloadJson } from '../utils/download'
import ThemeIndexedDB, { IDBRequestEvent } from '../utils/useIndexedDB'
import ModalStyle from './modal.module.css'

interface EditorHeader {
    onThemeChange?: (val: string) => void
    onRendererChange?: (val: Renderers) => void
    editorVal: string
}

const defaultThemeList = ['default', 'excel', 'dark', 'ggplot2', 'quartz', 'vox', 'fivethirtyeight', 'latimes', 'urbaninstitute', 'googlecharts', 'powerbi']

const rendererOptions = [
    { key: 'canvas', text: 'canvas' },
    { key: 'svg', text: 'svg', selected: true }
]

const DATABASE_NAME = 'vega_theme_designer'
const OBJECTSTORE_NAME = 'ThemeTable'

async function getRestThemeList (currentList: IDropdownOption[], callback: (restList: IDropdownOption[]) => void): Promise<void> {
    const callbackFun = function (event: IDBRequestEvent) {
    // 数据库创建或升级的时候会触发
        const db = event.target.result // 数据库对象
        db.createObjectStore(OBJECTSTORE_NAME, {
            keyPath: 'themeName' // 这是主键
        })
    } as (e: Event) => void
    const themeDB = new ThemeIndexedDB(DATABASE_NAME, 1)
    await themeDB.open(callbackFun)
    const allTheme = await themeDB.getAll(OBJECTSTORE_NAME)
    const restTheme = allTheme.filter(item => {
        return !defaultThemeList.includes(item?.themeName)
    })
    const restThemeList: IDropdownOption[] = restTheme.map(item => {
        return {
            key: item?.themeName,
            text: item?.themeName
        }
    })
    callback(restThemeList)
}

async function saveTheme (themeName: string, config: string): Promise<void> {
    const themeDB = new ThemeIndexedDB(DATABASE_NAME, 1)
    await themeDB.open()
    await themeDB.putValue(OBJECTSTORE_NAME, themeName, config)
    themeDB.close()
}

async function savaAs (themeName: string, config: string, onSuccess: () => void, onErr: () => void): Promise<void> {
    const themeDB = new ThemeIndexedDB(DATABASE_NAME, 1)
    await themeDB.open()
    themeDB.addValue(OBJECTSTORE_NAME, themeName, config)
        .then(onSuccess, onErr)
        .finally(() => { themeDB.close() })
}

export default function editorHeader (props: EditorHeader): JSX.Element {
    const { onThemeChange, onRendererChange, editorVal } = props

    const [themeOptions, setThemeOptions] = useState<IDropdownOption[]>([
        ...defaultThemeList.map(item => {
            if (item === 'default') {
                return { key: item, text: item, selected: true }
            }
            return { key: item, text: item }
        })
    ])
    const [modalShow, setModalShow] = useState<boolean>(false)
    const [theme, setTheme] = useState<string>('default')
    const [newTheme, setNewTheme] = useState<string>('')
    const [errMsg, setErrMsg] = useState<string>('')

    useEffect(() => {
        void getRestThemeList(
            themeOptions,
            (restList: IDropdownOption[]) => {
                setThemeOptions([...themeOptions, ...restList])
            })
    }, [])

    function themeHasSame (): void {
        setErrMsg('Theme alread existed')
    }

    function saveAsSuccess (): void {
        setErrMsg('')
        setModalShow(false)
    }

    function saveAsBtnClick (): void {
        void savaAs(newTheme, editorVal, saveAsSuccess, themeHasSame)
    }

    return (
        <div className={style['header-container']}>
            <Label className={style.label}>Theme:</Label>
            <Dropdown
                options={themeOptions}
                className={style.dropdown}
                onChange={(e, opt) => {
                    if (opt != null && onThemeChange != null) {
                        onThemeChange(opt.text)
                        setTheme(opt.text)
                    }
                }}
            />
            <Label className={style.label}>Renderer:</Label>
            <Dropdown
                options={rendererOptions}
                className={style.dropdown}
                onChange={(e, opt) => {
                    if (opt != null && onRendererChange != null) {
                        onRendererChange(opt.text as Renderers)
                    }
                }}
            />
            <DefaultButton className={style.button} onClick={() => { downloadJson(editorVal, theme) }}>Export Theme</DefaultButton>
            <DefaultButton className={style.button} onClick={() => { void saveTheme(theme, editorVal) }}>Save Theme</DefaultButton>
            <DefaultButton className={style.button} onClick={() => { setModalShow(true) }}>Save As</DefaultButton>
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
                            if (val !== undefined) {
                                setNewTheme(val)
                            }
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
                    <DefaultButton className={style.button} onClick={() => { setModalShow(false) }}>Cancel</DefaultButton>
                </div>
            </Modal>
        </div>
    )
}
