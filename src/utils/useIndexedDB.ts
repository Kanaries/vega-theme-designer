type IDBEventTarget = {
	result: IDBDatabase;
} & EventTarget;

export type IDBRequestEvent = {
	target: IDBEventTarget;
} & Event;

export default class ThemeIndexedDB {
	DBName = '';

	version = 1;

	DataBase: IDBDatabase | undefined;

	constructor(DBName: string, version: number) {
		this.DBName = DBName;
		this.version = version;
		this.DataBase = undefined;
	}

	async open(callback?: (e: Event) => void): Promise<IDBDatabase | Error> {
		const self = this;
		return new Promise((resolve, reject) => {
			let db: IDBDatabase;
			const request = indexedDB.open(this.DBName, this.version);

			request.onsuccess = function (event: IDBRequestEvent) {
				db = event.target.result; // 数据库对象
				self.DataBase = db;
				resolve(db);
			} as (e: Event) => void;

			request.onerror = function () {
				reject(new Error('connect database failed'));
			} as (e: Event) => void;

			request.onupgradeneeded = callback ?? (() => undefined);
		});
	}

	async getValue(
		storeName: string,
		key: string,
	): Promise<Record<string, string>> {
		return new Promise(resolve => {
			const request: IDBRequest<Record<string, string>> | undefined =
				this.DataBase?.transaction([storeName])
					.objectStore(storeName)
					.get(key);

			if (request != null) {
				request.onsuccess = function () {
					resolve(request.result);
				};
			}
		});
	}

	async getAll(storeName: string): Promise<Array<Record<string, string>>> {
		return new Promise((resolve, reject) => {
			const request:
				| IDBRequest<Array<Record<string, string>>>
				| undefined = this.DataBase?.transaction([storeName])
				.objectStore(storeName)
				.getAll();

			if (request) {
				request.onsuccess = function () {
					resolve(request.result);
				};

				request.onerror = function () {
					reject(new Error('get data failed'));
				};
			}
		});
	}

	async putValue(
		storeName: string,
		themeName: string,
		themeValue: any,
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const request: IDBRequest<IDBValidKey> | undefined =
				this.DataBase?.transaction([storeName], 'readwrite')
					.objectStore(storeName)
					.put({themeName, value: themeValue});

			if (request != null) {
				request.onsuccess = function () {
					resolve('write data success');
				};

				request.onerror = function (e) {
					console.log(e);
					reject(new Error('write data failed'));
				};
			}
		});
	}

	async addValue(
		storeName: string,
		themeName: string,
		themeValue: any,
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const request: IDBRequest<IDBValidKey> | undefined =
				this.DataBase?.transaction([storeName], 'readwrite')
					.objectStore(storeName)
					.add({themeName, value: themeValue});

			if (request != null) {
				request.onsuccess = function () {
					resolve(themeName);
				};

				request.onerror = function () {
					reject(new Error('write data failed'));
				};
			}
		});
	}

	async updateData(ObjectStoreName: string, key: string, val: any) {
		const themeDb = new ThemeIndexedDB(this.DBName, 1);
		await themeDb.open();
		await themeDb.putValue(ObjectStoreName, key, val);
		themeDb.close();
	}

	async addData(ObjectStoreName: string, key: string, val: any) {
		const themeDb = new ThemeIndexedDB(this.DBName, 1);
		await themeDb.open();
		await themeDb.addValue(ObjectStoreName, key, val);
		themeDb.close();
	}

	close(): void {
		this.DataBase?.close();
	}
}
