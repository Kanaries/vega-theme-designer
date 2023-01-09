import { useRef, useState, useEffect, MutableRefObject } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import styles from './Editor.module.css';
import { debounce } from 'lodash';


interface EditorProps {
	onChange: changeFunc;
	value: string;
	containerEl: MutableRefObject<HTMLDivElement | null>;
}

type changeFunc = (val: string) => void

export const Editor = (props: EditorProps) => {
	const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
	const monacoEl = useRef(null);

	// 挂载monaco到Dom
	useEffect(() => {
		if (monacoEl && !editor) {
			setEditor(
				monaco.editor.create(monacoEl.current!, {
					value: props.value,
					language: 'json'
				})
			);
		}
		
		if(editor && props.onChange) {
			const editorChangeDebounce = debounce(props.onChange, 300)
			editor.onDidChangeModelContent(() => {
				editorChangeDebounce(editor.getValue())
			})
		}

		return () => editor?.dispose();
	}, [monacoEl.current]);

	// 监听外部对编辑器值的改变
	useEffect(() => {
    if (props.value) {
      editor?.setValue(props.value);
    }
  }, [props.value]);

	// 大小自适应
	useEffect(() => {
    const observer = new ResizeObserver(() => {
      window.setTimeout(() => editor?.layout(), 0);
    });
    observer.observe(props.containerEl.current!);
    return () => {
      observer.disconnect();
    };
  }, []);

	return <div className={styles.Editor} ref={monacoEl}></div>;
};
