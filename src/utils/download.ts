export default function downloadJson(jsonText: string, filename: string): void {
	const eleLink: HTMLAnchorElement = document.createElement('a');
	eleLink.download = `${filename}.json`;
	eleLink.style.display = 'none';
	// 字符内容转变成blob地址
	const blob: Blob = new Blob([jsonText]);
	eleLink.href = URL.createObjectURL(blob);
	// 触发点击
	eleLink.click();
}
