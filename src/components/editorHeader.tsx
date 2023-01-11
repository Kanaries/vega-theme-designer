import React, { FormEvent, useEffect, useState } from 'react'
import { Dropdown, PrimaryButton, Label, DefaultButton, Modal, TextField, IDropdownOption } from '@fluentui/react'
import style from './editorHeader.module.css'
import { Renderers } from 'vega'
import { downloadJson } from '../utils/download'
import ThemeIndexedDB, { IDBRequestEvent } from '../utils/useIndexedDB'
import ModalStyle from './modal.module.css'
import { useTranslation } from 'react-i18next'

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

const langOption = [
    { key: 'en', text: 'English', selected: true },
    { key: 'zh', text: '简体中文' }
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

async function savaAs (themeName: string, config: string, onSuccess: (res: string) => void, onErr: () => void): Promise<void> {
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

    const { t, i18n } = useTranslation()

    useEffect(() => {
        void getRestThemeList(
            themeOptions,
            (restList: IDropdownOption[]) => {
                setThemeOptions([...themeOptions, ...restList])
            })
    }, [])

    function themeHasSame (): void {
        setErrMsg(t('vegaDesigner.saveAs.Modal.errorTip') as unknown as string)
    }

    function saveAsSuccess (themeName: string): void {
        setErrMsg('')
        setModalShow(false)
        setThemeOptions([...themeOptions, { key: themeName, text: themeName }])
    }

    function saveAsBtnClick (): void {
        void savaAs(newTheme, editorVal, saveAsSuccess, themeHasSame)
    }

    return (
        <div className={style['header-container']}>
            <Label className={style.label}>{t('vegaDesigner.theme')}:</Label>
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
            <Label className={style.label}>{t('vegaDesigner.renderer')}:</Label>
            <Dropdown
                options={rendererOptions}
                className={style.dropdown}
                onChange={(e, opt) => {
                    if (opt != null && onRendererChange != null) {
                        onRendererChange(opt.text as Renderers)
                    }
                }}
            />
            <DefaultButton className={style.button} onClick={() => { downloadJson(editorVal, theme) }}>{t('vegaDesigner.exportBtn')}</DefaultButton>
            <DefaultButton className={style.button} onClick={() => { void saveTheme(theme, editorVal) }}>{t('vegaDesigner.saveTheme')}</DefaultButton>
            <DefaultButton className={style.button} onClick={() => { setModalShow(true) }}>{t('vegaDesigner.saveAs.btn')}</DefaultButton>
            <div className={style.lang}>
                <Dropdown
                    options={langOption}
                    onChange={(e, opt) => {
                        if (opt != null) {
                            void i18n.changeLanguage(opt.key as string)
                        }
                    }}
                />
                <Label className={style.label}>{t('vegaDesigner.language')}:</Label>
            </div>
            <Modal isOpen={modalShow} containerClassName={ModalStyle.container}>
                <div className={ModalStyle.header}>
                    <Label className={ModalStyle['modal-title']}>{t('vegaDesigner.saveAs.Modal.title')}:</Label>
                </div>
                <div>
                    <TextField
                        label={t('vegaDesigner.saveAs.Modal.inputLabel') as unknown as string}
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
                        {t('vegaDesigner.saveAs.Modal.confirm')}
                    </PrimaryButton>
                    <DefaultButton className={style.button} onClick={() => { setModalShow(false) }}>{t('vegaDesigner.saveAs.Modal.cancel')}</DefaultButton>
                </div>
            </Modal>
        </div>
    )
}
