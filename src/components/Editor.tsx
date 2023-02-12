import React, {
	useRef, useState, useEffect, type MutableRefObject, ReactElement,
} from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {observer} from 'mobx-react-lite';
import styles from './Editor.module.css';
import {debounce, addEventListen, removeEventListen} from '../utils/utils';
import {useUserStore} from '../store/userStore';
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
	const userStore = useUserStore();
	const {curTheme} = userStore;
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
			const ro = new ResizeObserver(() => {
				window.setTimeout(() => {
					editor.layout();
				}, 0);
			});
			if (containerEl.current) {
				ro.observe(containerEl.current);
			}

			return () => {
				ro.disconnect();
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

	useEffect(() => {
		if (curTheme) {
			editor?.setValue(curTheme.configs);
		} else {
			editor?.setValue('{}');
		}
	}, [curTheme]);

	return (
		<div
			className={styles.Editor}
			ref={monacoEl}
		/>
	);
}

export default observer(Editor);
