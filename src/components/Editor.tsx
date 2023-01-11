import React, { useRef, useState, useEffect, MutableRefObject } from 'react'
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import styles from './Editor.module.css'
import { debounce } from '../utils/utils'

interface EditorProps {
    onChange?: changeFunc
    value: string
    containerEl: MutableRefObject<HTMLDivElement | null>
}

type changeFunc = (val: string) => void

export const Editor = (props: EditorProps): JSX.Element => {
    const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null)
    const monacoEl = useRef(null)
    const { onChange, value, containerEl } = props
    // 挂载monaco到Dom
    useEffect(() => {
        if (monacoEl.current != null && (editor == null)) {
            setEditor(monaco.editor.create(monacoEl.current, {
                value,
                language: 'json',
                automaticLayout: true
            }))
        }

        if ((editor != null) && (onChange != null)) {
            const editorChangeDebounce = debounce(onChange, 300)
            editor.onDidChangeModelContent(() => {
                if (editor != null) {
                    editorChangeDebounce(editor.getValue())
                }
            })
            console.log('r')
            const observer = new ResizeObserver(() => {
                window.setTimeout(() => { editor.layout() }, 0)
            })
            if (containerEl.current != null) {
                observer.observe(containerEl.current)
            }
            return () => {
                observer.disconnect()
            }
        }

        return () => {
            editor?.dispose()
        }
    }, [monacoEl.current])

    // 监听外部对编辑器值的改变
    useEffect(() => {
        if (value.length > 0 && editor != null) {
            editor.setValue(value)
        }
    }, [value])

    return <div className={styles.Editor} ref={monacoEl}></div>
}
