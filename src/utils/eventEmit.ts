const eventMap: Record<string, Array<Function | undefined>> = {};

export function addEventListen(eventName: string, func: Function): number {
	if (eventMap[eventName]) {
		eventMap[eventName].push(func);
	} else {
		eventMap[eventName] = [func];
	}

	return eventMap[eventName].length - 1;
}

export function emitEvent(eventName: string, val?: any): void {
	const opt = val || {};
	if (eventMap[eventName]) {
		eventMap[eventName].forEach(item => {
			if (item) {
				item(opt);
			}
		});
	}
}

export function removeEventListen(
	eventName: string,
	listenIndex: number,
): void {
	if (eventMap[eventName]) {
		if (eventMap[eventName][listenIndex]) {
			eventMap[eventName][listenIndex] = undefined;
		}
	}
}

export function removeAllEvent(eventName: string): void {
	if (eventMap[eventName]) {
		eventMap[eventName] = [];
	}
}
