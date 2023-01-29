import React, {
	useRef, useState, useEffect, type MutableRefObject, ReactElement,
} from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import styles from './Editor.module.css';
import {debounce, addEventListen, removeEventListen} from '../utils/utils';
import {setEditorValue} from './editorValue';

type ChangeFunc = (val: string) => void;

type EditorProps = {
	onChange: ChangeFunc;
	containerEl: MutableRefObject<HTMLDivElement | undefined>;
};

function Editor(props: EditorProps): ReactElement {
	const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | undefined>(undefined);
	const monacoEl =
		useRef<HTMLDivElement | undefined>(undefined) as MutableRefObject<HTMLDivElement>;
	const {onChange, containerEl} = props;
	// 挂载monaco到Dom
	useEffect(() => {
		if (monacoEl.current && editor === undefined) {
			setEditor(monaco.editor.create(monacoEl.current, {
				value: '{}',
				language: 'json',
				automaticLayout: true,
				minimap: {
					enabled: false, // 不要小地图
				},
			}));
		}

		if (editor && onChange) {
			const editorChangeDebounce = debounce(onChange, 300);
			editor.onDidChangeModelContent(() => {
				if (editor) {
					const currentValue = editor.getValue();
					editorChangeDebounce(currentValue);
					setEditorValue(currentValue);
				}
			});
			const observer = new ResizeObserver(() => {
				window.setTimeout(() => {
					editor.layout();
				}, 0);
			});
			if (containerEl.current) {
				observer.observe(containerEl.current);
			}

			return () => {
				observer.disconnect();
			};
		}

		return () => {
			editor?.dispose();
		};
	});

	// 监听外部对编辑器值的改变
	useEffect(() => {
		const changeEditorValue = (opt: Record<string, string>) => {
			if (editor && opt.val) {
				editor.setValue(opt.val);
			}
		};
		const callbackIndex = addEventListen('editorChange', changeEditorValue);

		return () => {
			removeEventListen('editorChange', callbackIndex);
		};
	});

	return (
		<div
			className={styles.Editor}
			ref={monacoEl}
		/>
	);
}

export default React.memo(Editor);
