/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
export function getServerUrl(path: string) {
	const baseURL = new URL(window.location.href);
	const DATA_SERVER_URL = baseURL.searchParams.get('main_service') || localStorage.getItem('main_service') || window.location.href;
	// const devSpecURL = new URL(w|| window.location.href)
	const url = new URL(DATA_SERVER_URL);
	url.pathname = path;
	url.search = '';
	url.hash = '';
	if (baseURL.searchParams.get('service')) {
		url.href = baseURL.searchParams.get('service') + path;
	}
	return url.toString();
}

export type IResponse<T = void> = {
  success: true;
  data: T;
} | {
  success: false;
  message: string;
};

async function getRequest<T extends Record<string, unknown>, R>(path: string, payload?: T): Promise<R> {
	const url = new URL(path);
	if (payload) {
		(Object.keys(payload) as (keyof T & string)[]).forEach(k => {
			if (Array.isArray(payload[k])) {
				for (const val of payload[k] as string[]) {
					url.searchParams.append(k, val);
				}
			} else {
				url.searchParams.append(k as string, `${payload[k]}`);
			}
		});
	}
	const res = await fetch(url.toString(), {
		credentials: 'include',
	});
	const result = await res.json() as IResponse<R>;
	if (result.success) {
		return result.data;
	}
	throw new Error(result.message);
}

async function getRawRequest<T extends Record<string, unknown>>(path: string, payload?: T): Promise<Response> {
	const url = new URL(path);
	if (payload) {
		(Object.keys(payload) as (keyof T & string)[]).forEach(k => {
			if (Array.isArray(payload[k])) {
				for (const val of payload[k] as string[]) {
					url.searchParams.append(k, val);
				}
			} else {
				url.searchParams.append(k, `${payload[k]}`);
			}
		});
	}
	const result = await fetch(url.toString(), {
		credentials: 'include',
	});
	return result;
}

async function postRequest<T extends Record<string, unknown>, R>(path: string, payload?: T): Promise<R> {
	const url = new URL(path);
	const res = await fetch(url.toString(), {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});
	const result = await res.json() as IResponse<R>;
	if (result.success) {
		return result.data;
	}
	throw new Error(result.message);
}
async function delRequest<T extends Record<string, unknown>, R>(path: string, payload?: T): Promise<R> {
	const url = new URL(path);
	const res = await fetch(url.toString(), {
		method: 'DELETE',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});
	const result = await res.json() as IResponse<R>;
	if (result.success) {
		return result.data;
	}
	throw new Error(result.message);
}
async function putRequest<T extends Record<string, unknown>, R>(path: string, payload?: T): Promise<R> {
	const url = new URL(path);
	const res = await fetch(url.toString(), {
		method: 'PUT',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(payload),
	});
	const result = await res.json() as IResponse<R>;
	if (result.success) {
		return result.data;
	}
	throw new Error(result.message);
}

const request = {
	get: getRequest,
	getRaw: getRawRequest,
	post: postRequest,
	put: putRequest,
	del: delRequest,
};

export default request;
