import * as monaco from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

self.MonacoEnvironment = {
	getWorker(_: any, label: string) {
		if (label === 'json') {
			return new JsonWorker();
		}
		return new EditorWorker();
	},
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
