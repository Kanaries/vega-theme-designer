export interface IDBRequestEvent extends Event {
    target: IDBEventTarget
}

interface IDBEventTarget extends EventTarget {
    result: IDBDatabase
}

export default class ThemeIndexedDB {
    DBName: string
    version: number = 1
    DataBase: IDBDatabase | null
    constructor (DBName: string, version: number) {
        this.DBName = DBName
        this.version = version
        this.DataBase = null
    }

    async open (callback?: (e: Event) => void): Promise<IDBDatabase | Error> {
        const self = this
        return await new Promise((resolve, reject) => {
            let db: IDBDatabase
            const request = indexedDB.open(this.DBName, this.version)

            request.onsuccess = function (event: IDBRequestEvent) {
                db = event.target.result // 数据库对象
                self.DataBase = db
                resolve(db)
            } as (e: Event) => void

            request.onerror = function (event: IDBRequestEvent) {
                reject(new Error('connect database failed'))
            } as (e: Event) => void

            request.onupgradeneeded = (callback != null) ? callback : () => {}
        })
    }

    async getValue (storeName: string, key: string): Promise<Record<string, string>> {
        return await new Promise((resolve, reject) => {
            const request: IDBRequest<Record<string, string>> | undefined =
        this.DataBase?.transaction([storeName]).objectStore(storeName).get(key)

            if (request != null) {
                request.onsuccess = function () {
                    resolve(request.result)
                }

                request.onerror = function (event) {
                    console.log('get data failed', event)
                }
            }
        })
    }

    async getAll (storeName: string): Promise<Array<Record<string, string>>> {
        return await new Promise((resolve, reject) => {
            const request: IDBRequest<Array<Record<string, string>>> | undefined =
        this.DataBase?.transaction([storeName]).objectStore(storeName).getAll()

            if (request != null) {
                request.onsuccess = function () {
                    resolve(request.result)
                }

                request.onerror = function (event) {
                    reject(new Error('get data failed'))
                }
            }
        })
    }

    async putValue (
        storeName: string,
        themeName: string,
        themeValue: string
    ): Promise<string> {
        return await new Promise((resolve, reject) => {
            const request: IDBRequest<IDBValidKey> | undefined =
        this.DataBase?.transaction([storeName], 'readwrite')
            .objectStore(storeName)
            .put({ themeName, value: themeValue })

            if (request != null) {
                request.onsuccess = function () {
                    resolve('write data success')
                }

                request.onerror = function () {
                    reject(new Error('write data failed'))
                }
            }
        })
    }

    async addValue (
        storeName: string,
        themeName: string,
        themeValue: string
    ): Promise<string> {
        return await new Promise((resolve, reject) => {
            const request: IDBRequest<IDBValidKey> | undefined =
        this.DataBase?.transaction([storeName], 'readwrite')
            .objectStore(storeName)
            .add({ themeName, value: themeValue })

            if (request != null) {
                request.onsuccess = function () {
                    resolve(themeName)
                }

                request.onerror = function () {
                    reject(new Error('write data failed'))
                }
            }
        })
    }

    close (): void {
        this.DataBase?.close()
    }
}
