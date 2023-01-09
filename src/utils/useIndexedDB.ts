import { reject } from "lodash";
export interface IDBRequestEvent extends Event {
  target: IDBEventTarget;
}

interface IDBEventTarget extends EventTarget {
  result: IDBDatabase;
}

export default class ThemeIndexedDB {
  DBName: string;
  version: number = 1;
  DataBase: IDBDatabase | null;
  constructor(DBName: string, version: number) {
    this.DBName = DBName;
    this.version = version;
    this.DataBase = null;
  }

  open(callback?: (e: Event) => void) {
    let self = this;
    return new Promise((resolve, reject) => {
      let db: IDBDatabase;
      const request = indexedDB.open(this.DBName, this.version);

      request.onsuccess = function (event: IDBRequestEvent) {
        db = event.target.result; // 数据库对象
        self.DataBase = db;
        resolve(db);
      } as (e: Event) => void;

      request.onerror = function (event: IDBRequestEvent) {
        reject("connect database failed");
      } as (e: Event) => void;

      request.onupgradeneeded = callback || (() => {});
    });
  }

  getValue(storeName: string, key: string): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
      const request: IDBRequest<Record<string, string>> | undefined =
        this.DataBase?.transaction([storeName]).objectStore(storeName).get(key);

      if (request) {
        request.onsuccess = function () {
          resolve(request.result);
        };

        request.onerror = function (event) {
          console.log("get data failed", event);
        };
      }
    });
  }

  getAll(storeName: string): Promise<Array<Record<string, string>>> {
    return new Promise((resolve, reject) => {
      const request: IDBRequest<Array<Record<string, string>>> | undefined =
        this.DataBase?.transaction([storeName]).objectStore(storeName).getAll();

      if (request) {
        request.onsuccess = function () {
          resolve(request.result);
        };

        request.onerror = function (event) {
          reject("get data failed");
        };
      }
    });
  }

  putValue(
    storeName: string,
    themeName: string,
    themeValue: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const request: IDBRequest<IDBValidKey> | undefined =
        this.DataBase?.transaction([storeName], "readwrite")
          .objectStore(storeName)
          .put({ themeName, value: themeValue });

      if (request) {
        request.onsuccess = function () {
          resolve("write data success");
        };

        request.onerror = function () {
          reject("write data failed");
        };
      }
    });
  }

  addValue(
    storeName: string,
    themeName: string,
    themeValue: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const request: IDBRequest<IDBValidKey> | undefined =
        this.DataBase?.transaction([storeName], "readwrite")
          .objectStore(storeName)
          .add({ themeName, value: themeValue });

      if (request) {
        request.onsuccess = function () {
          resolve("write data success");
        };

        request.onerror = function () {
          reject("write data failed");
        };
      }
    });
  }

  close() {
    this.DataBase && this.DataBase.close();
  }
}
