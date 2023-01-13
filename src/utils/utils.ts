type Params = Array<string | number | boolean | Record<string, unknown>>;

// eslint-disable-next-line @typescript-eslint/ban-types
export function debounce(func: Function, delay: number, immediate = false): Function {
	let timer: number | undefined;
	let isImmediate = immediate;
	return function (this: unknown, ...args: Params) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		if (isImmediate) {
			func.apply(self, args);
			isImmediate = false;
			return;
		}

		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(self, args);
		}, delay);
	};
}

export const onlyOneFunc = function<T> (func: (...args: any[]) => T): (...args: any[]) => T | void {
	let hasRun = false;
	// eslint-disable-next-line consistent-return
	return function (this: unknown, ...args: any[]): void | T {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		if (!hasRun) {
			hasRun = true;
			return func.apply(self, args);
		}
	};
};

const eventMap: Record<string, Array<((val: Record<string, string>) => void) | undefined>> = {};

export function addEventListen(
	eventName: string,
	func: (val: Record<string, string>) => void,
): number {
	if (eventMap[eventName]) {
		eventMap[eventName].push(func);
	} else {
		eventMap[eventName] = [func];
	}

	return eventMap[eventName].length - 1;
}

export function emitEvent(eventName: string, val: Record<string, string>): void {
	if (eventMap[eventName]) {
		eventMap[eventName].forEach((item) => {
			if (item) {
				item(val);
			}
		});
	}
}

export function removeEventListen(eventName: string, listenIndex: number): void {
	if (eventMap[eventName]) {
		if (eventMap[eventName][listenIndex]) {
			eventMap[eventName][listenIndex] = undefined;
		}
	}
}
