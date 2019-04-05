function Database(option) {
    if (typeof option !== "object" || option === null) throw new Error();
    this._init_(option);

}

Database.prototype = {
    _init_: function (option) {
        let self = this;
        Database.defineProperty(self, "$option", option);
        Database.defineProperty(self, "$ready", []);
        Object.defineProperty(self, "ready", {
            enumerable: false,
            configurable: false,
            set: function setter(newVal) {
                self.$ready.push(newVal);
                if (self.$DB) {
                    while (self.$ready.length > 0) {
                        self.$ready.pop()(self);
                    }
                }
            }
        });

        let request = window.indexedDB.open(self.$option.DB, self.$option.version);
        request.onupgradeneeded = function (e) {
            let db = e.target.result;
            let objectStore;
            Object.keys(self.$option.ObjectStore).forEach(function (key) {
                let ObjectStore = self.$option.ObjectStore[key];
                if (db.objectStoreNames.contains(ObjectStore.name)) {

                } else {
                    objectStore = db.createObjectStore(ObjectStore.name, {
                        keyPath: ObjectStore.keyPath,
                        autoIncrement: ObjectStore.autoIncrement !== undefined ? ObjectStore.autoIncrement : true
                    });

                    Object.keys(ObjectStore.Index).forEach(function (key) {
                        let Index = ObjectStore.Index[key];
                        objectStore.createIndex(Index.name, Index.key, {unique: Index.unique});
                    });
                }
            });
            if (typeof self.$option.onupgradeneeded === "function") self.$option.onupgradeneeded.call(self, db);

        };
        request.onsuccess = function (e) {
            let db = e.target.result;
            Database.defineProperty(self, "$DB", db);

            while (self.$ready.length > 0) {
                self.$ready.pop()(self);
            }
        };
        request.onerror = function (e) {
            console.log('数据库打开报错');
        };


    },
    ReadOnly: function (StoreArray, objectStore) {
        let transaction = this.$DB.transaction(StoreArray, 'readonly');
        return transaction.objectStore(objectStore);
    },
    ReadWrite: function (StoreArray, objectStore) {
        let transaction = this.$DB.transaction(StoreArray, 'readwrite');
        return transaction.objectStore(objectStore);
    },
    Add: function (option) {
        let request = this.ReadWrite(option.StoreArray, option.objectStore);
        request = request.add(option.data);

        request.onsuccess = function (event) {
            if (typeof option.success === "function") {
                option.success(event);
            }
        };
        request.onerror = function (event) {
            if (typeof option.error === "function") {
                option.error(event);
            }
        };
    },
    Read: function (option) {
        let objectStore = this.ReadOnly(option.StoreArray, option.objectStore);
        let request = objectStore.get(option.key);

        request.onerror = function (event) {
            if (typeof option.error === "function") {
                option.error(event);
            }
        };

        request.onsuccess = function (event) {
            if (typeof option.success === "function") {
                option.success(request.result);
            }
        };
    },
    ReadAll: function readAll(option) {
        let objectStore = this.ReadWrite(option.StoreArray, option.objectStore);
        let Cursor;
        if (option.index) {
            objectStore = objectStore.index(option.index);
        }
        Cursor = objectStore.openCursor(option.key || null, option.SortType || "next");
        Cursor.onsuccess = function (event) {
            let cursor = event.target.result;
            if (cursor) {
                if (typeof option.success === "function") {
                    if (!option.success(cursor, cursor.value)) {
                        option.success(null, null);
                        return;
                    }
                }
                cursor.continue();
            } else {
                if (typeof option.success === "function") option.success(null, null);
            }
        };
        Cursor.onerror = function (event) {
            if (typeof option.error === "function") {
                option.error(event);
            }
        };
    },
    Update: function update(option) {
        let request = this.ReadWrite(option.StoreArray, option.objectStore)
            .put(option.data);
        request.onerror = function (event) {
            if (typeof option.error === "function") {
                option.error(event);
            }
        };

        request.onsuccess = function (event) {
            if (typeof option.success === "function") {
                option.success(request.result);
            }
        };
    },
    Remove: function (option) {
        let objectStore = this.ReadWrite(option.StoreArray, option.objectStore);
        let request = objectStore.delete(option.key);

        request.onerror = function (event) {
            if (typeof option.error === "function") {
                option.error(event);
            }
        };

        request.onsuccess = function (event) {
            if (typeof option.success === "function") {
                option.success(request.result);
            }
        };
    },
    DeleteDatabase: function (option) {
        option = option || {};
        let self = this;
        let DBDeleteRequest = window.indexedDB.deleteDatabase(option.DB || self.$option.DB);

        request.onerror = function (event) {
            if (typeof option.error === "function") {
                option.error(event);
            }
        };

        request.onsuccess = function (event) {
            if (typeof option.success === "function") {
                option.success(request.result);
            }
        };
    },
    Clear: function (option) {
        let objectStore = this.ReadWrite(option.StoreArray, option.objectStore);
        let request = objectStore.clear();
        request.onerror = function (event) {
            if (typeof option.error === "function") {
                option.error(event);
            }
        };

        request.onsuccess = function (event) {
            if (typeof option.success === "function") {
                option.success(request.result);
            }
        };
    }
};
/**
 * @return {number}
 */
Database.GetTime = function () {
    return new Date().getTime();
};
Database.defineProperty = function (self, key, value, enumerable, configurable) {
    Object.defineProperty(self, key, {
        enumerable: !!enumerable,
        configurable: !!configurable,
        get: function getter() {
            return value || null;
        },
        set: function setter(newVal) {

        }
    });
};
