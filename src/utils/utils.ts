import {
	addEventListen as myAddEventListen,
	removeAllEvent as myRemoveAllEvent,
	removeEventListen as myRemoveEventListen,
	emitEvent as myEmitEvent,
} from './eventEmit';

type Params = Array<string | number | boolean | Record<string, unknown>>;

export const addEventListen = myAddEventListen;

export const removeAllEvent = myRemoveAllEvent;

export const removeEventListen = myRemoveEventListen;

export const emitEvent = myEmitEvent;

export function debounce(
	func: Function,
	delay: number,
	immediate = false,
): Function {
	let timer: number | undefined;
	let isImmediate = immediate;
	return function (this: unknown, ...args: Params) {
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
