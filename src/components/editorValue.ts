const editorValueChangeCallbackList: Array<
	((val: string) => void) | undefined
> = [];

export const editorValue: Record<string, string> = {current: '{}'};

export function setEditorValue(val: string): void {
	const lastVal = editorValue.current;
	if (lastVal !== val) {
		editorValue.current = val;
		editorValueChangeCallbackList.forEach(item => {
			if (item && lastVal !== val) {
				item(val);
			}
		});
	}
}

export function getEditorValue() {
	return editorValue.current;
}

export function addEditorValueChangeCallback(
	func: (val: string) => void,
): number {
	editorValueChangeCallbackList.push(func);
	return editorValueChangeCallbackList.length - 1;
}

export function removerCallback(index: number): void {
	editorValueChangeCallbackList[index] = undefined;
}
