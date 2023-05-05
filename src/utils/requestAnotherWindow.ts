// eslint-disable-next-line max-len
export const requestAnotherWindow = async (url: string, onMessage?: (window: Window, ev: MessageEvent) => void) => new Promise<void>((resolve, reject) => {
	const login = window.open(url);
	if (login) {
		const cb = (ev: MessageEvent) => {
			onMessage?.(login, ev);
		};
		window.addEventListener('message', cb);
		let interval: number;
		const checkIfOpen = () => {
			if (login.closed) {
				clearTimeout(interval);
				resolve();
				window.removeEventListener('message', cb);
			} else {
				interval = setTimeout(checkIfOpen, 200);
			}
		};
		checkIfOpen();
	} else {
		reject();
	}
});

export default requestAnotherWindow;
