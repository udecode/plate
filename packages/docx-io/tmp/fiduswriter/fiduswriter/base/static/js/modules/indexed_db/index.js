// Changing this number will make clients flush their database.
const DB_VERSION = 4

export class IndexedDB {
    constructor(app) {
        this.app = app
    }

    init() {
        this.app["db_config"] = {
            db_name: this.app.config.user.username
        }
        // Open/Create db if it doesn't exist
        const request = window.indexedDB.open(
            this.app.db_config.db_name,
            DB_VERSION
        )

        request.onerror = event => this.reset(event)
        return new Promise(resolve => {
            request.onsuccess = event => {
                const database = event.target.result
                database.close()
                resolve()
            }

            request.onupgradeneeded = event => this.onUpgradeNeeded(event)
        })
    }

    onUpgradeNeeded(event) {
        const db = event.target.result
        Array.from(db.objectStoreNames).forEach(name =>
            db.deleteObjectStore(name)
        )
        Object.entries(this.app.routes).forEach(([route, props]) => {
            if (props.dbTables) {
                Object.entries(props.dbTables).forEach(
                    ([tableName, tableProperties]) =>
                        db.createObjectStore(
                            `${route}_${tableName}`,
                            tableProperties
                        )
                )
            }
        })
    }

    updateData(objectStoreName, data) {
        const request = window.indexedDB.open(
            this.app.db_config.db_name,
            DB_VERSION
        )
        request.onerror = event => {
            this.reset(event).then(() => this.updateData(objectStoreName, data))
        }

        request.onsuccess = event => {
            const db = event.target.result
            const objectStore = db
                .transaction(objectStoreName, "readwrite")
                .objectStore(objectStoreName)
            for (const d in data) {
                objectStore.put(d)
            }
        }

        request.onupgradeneeded = event => this.onUpgradeNeeded(event)
    }

    insertData(objectStoreName, data, retry = true) {
        const request = window.indexedDB.open(
            this.app.db_config.db_name,
            DB_VERSION
        )
        request.onerror = function (event) {
            return this.reset(event).then(() =>
                this.insertData(objectStoreName, data, false)
            )
        }
        request.onsuccess = event => {
            const db = event.target.result
            try {
                const transaction = db.transaction(objectStoreName, "readwrite")
                const objectStore = transaction.objectStore(objectStoreName)
                if (data !== undefined) {
                    data.forEach(document => {
                        objectStore.put(document)
                    })
                }
            } catch (error) {
                if (retry) {
                    // Before resetting IndexedDB make sure to close connections to avoid blocking the
                    // delete IndexedDB process
                    db.close()
                    this.reset().then(() =>
                        this.insertData(objectStoreName, data, false)
                    )
                    return
                } else {
                    throw error
                }
            }
        }

        request.onupgradeneeded = event => this.onUpgradeNeeded(event)
    }

    reset(event = false) {
        if (event) {
            const database = event.target?.result
            if (database) {
                database.close()
            }
        }
        return new Promise(resolve => {
            const delRequest = window.indexedDB.deleteDatabase(
                this.app.db_config.db_name
            )
            delRequest.onerror = () => {
                this.init().then(() => resolve())
            }
            delRequest.onsuccess = () => {
                // Resolve the promise after the indexedDB is set up.
                this.init().then(() => resolve())
            }
        })
    }

    clearData(objectStoreName) {
        return new Promise(resolve => {
            const request = window.indexedDB.open(
                this.app.db_config.db_name,
                DB_VERSION
            )
            request.onerror = () => {}
            request.onsuccess = event => {
                const db = event.target.result
                try {
                    const objectStore = db
                        .transaction(objectStoreName, "readwrite")
                        .objectStore(objectStoreName)
                    const objectStoreReq = objectStore.clear()
                    objectStoreReq.onsuccess = () => {
                        db.close()
                        // Resolve the promise after the ObjectStore has been cleared.
                        resolve()
                    }
                } catch (error) {
                    // Before resetting IndexedDB make sure to close connections to avoid blocking the
                    // delete IndexedDB process
                    db.close()
                    if (error.name === "NotFoundError") {
                        // Resolve the promise after indexed DB is set up.
                        this.reset().then(() => resolve())
                    } else {
                        throw error
                    }
                }
            }
            request.onupgradeneeded = event => this.onUpgradeNeeded(event)
        })
    }

    readAllData(objectStoreName) {
        return new Promise((resolve, reject) => {
            const request = window.indexedDB.open(
                this.app.db_config.db_name,
                DB_VERSION
            )
            request.onerror = event => {
                reject(event)
            }
            request.onsuccess = event => {
                const db = event.target.result
                if (
                    !Array.from(db.objectStoreNames).includes(objectStoreName)
                ) {
                    db.close()
                    return this.reset()
                        .then(() => this.readAllData(objectStoreName))
                        .then(readPromise => resolve(readPromise))
                }
                const objectStore = db
                    .transaction(objectStoreName, "readwrite")
                    .objectStore(objectStoreName)
                const readAllRequest = objectStore.getAll()
                readAllRequest.onerror = event => {
                    reject(event)
                }
                readAllRequest.onsuccess = _event => {
                    // Do something with the request.result!
                    resolve(readAllRequest.result)
                }
            }
            request.onupgradeneeded = event => this.onUpgradeNeeded(event)
        })
    }
}
