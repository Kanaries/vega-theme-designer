function downloadJson(jsonText: string | (() => string), filename: string): void {
	let json = '';
	if (typeof jsonText === 'function') {
		json = jsonText();
	} else {
		json = jsonText;
	}

	const eleLink: HTMLAnchorElement = document.createElement('a');
	eleLink.download = `${filename}.json`;
	eleLink.style.display = 'none';
	// 字符内容转变成blob地址
	const blob: Blob = new Blob([json]);
	eleLink.href = URL.createObjectURL(blob);
	// 触发点击
	eleLink.click();
}

export default downloadJson;
