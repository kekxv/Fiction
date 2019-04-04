/**
 * 获取坐标
 * @param x {number}
 * @param y {number}
 * @param w {number}
 * @param h {number}
 * @param t {number}
 * @returns {number}
 * @constructor
 */
function TouchWhere(x, y, w, h, t) {
    t = t || 2;
    let _w = w / t;
    let _h = h / t;

    let c = parseInt((x / _w));
    let r = parseInt((y / _h));
    return r * t + c;
}

let bookShelf = new Vue({
    el: ".bookShelf",
    data: {
        search: false,
        list: [],
        searchKeyword: ""
    },
    methods: {
        showCatalog: async function (book, update) {
            let index = layer.load(1, {
                shade: [0.2, '#FFF'] //0.1透明度的白色背景
            });
            if (window.navigator.onLine && !update) {
                book.catalog = await api.catalog(book.data.url);
                DB.Update({
                    StoreArray: ["books"],
                    objectStore: "books",
                    data: book,
                    success: function (e) {
                        layer.msg('更新目录成功。。', {icon: 1});
                    },
                    error: function (e) {
                        layer.msg('更新目录失败。。', {icon: 2});
                    }
                });
            } else if (book.catalog.length === 0) {
                layer.msg('请检查网络。。', {icon: 2});
                return;
            }
            bookCatalog.book = book;
            layer.close(index);
        },
        ReadBook: function (book) {
            if (book.CatalogIndex < 0) {
                this.showCatalog(book, book.catalog.length > 0);
                return;
            }
            bookRead.book = book;
            bookRead.CatalogIndex = book.CatalogIndex;
        },
        UpdateData: function () {
            let da = [];
            let index = layer.load(1, {
                shade: [0.2, '#FFF'] //0.1透明度的白色背景
            });
            new Promise((resolve, reject) => {
                DB.ReadAll({
                    StoreArray: ["books"],
                    objectStore: "books",
                    success: function (cursor, value) {
                        if (cursor) {
                            da.push(value)
                        } else {
                            resolve(da);
                        }
                        return true;
                    }
                });
            }).then(function (data) {
                bookShelf.list = (data);

                for (let i in bookShelf.list) {
                    if (bookShelf.list.hasOwnProperty(i)) {
                        let item = bookShelf.list[i];
                        api.update(item.data).then(async function (bookinfo) {
                            let isUpdate = item.data.time.trim() !== bookinfo.time.trim();
                            if (isUpdate) {
                                layer.msg(`《${bookinfo.title}》有更新。。`, {icon: 1});
                                item.data = bookinfo;
                                item.catalog = await api.catalog(bookinfo.url);
                                DB.Update({
                                    StoreArray: ["books"],
                                    objectStore: "books",
                                    data: item,
                                    success: function (e) {
                                    },
                                    error: function (e) {
                                        layer.msg('更新失败。。', {icon: 2});
                                    }
                                });
                            }
                        });
                    }
                }

                bookShelf.search = false;
                layer.close(index);
            });
        },
        searchBook: async function () {
            if (this.searchKeyword.length === 0) {
                this.UpdateData();
                return;
            }
            let index = layer.load(1, {
                shade: [0.2, '#FFF'] //0.1透明度的白色背景
            });
            this.search = true;
            this.list = await api.search(this.searchKeyword);
            this.searchKeyword = "";
            layer.close(index);
        },
        AddBook: function (data) {
            DB.Add({
                StoreArray: ["books"],
                objectStore: "books",
                data: data,
                success: function (e) {
                    layer.msg('添加成功。。', {icon: 1});
                },
                error: function (e) {
                    layer.msg('添加失败,已存在书架中。。', {icon: 2});
                }
            });
        },
        DelBook: function (data) {
            DB.Remove({
                StoreArray: ["books"],
                objectStore: "books",
                key: data.title,
                success: function (result) {
                    bookShelf.UpdateData();
                },
                error: function (result) {
                    bookShelf.UpdateData();
                }
            });
        },

    }
});
let bookCatalog = new Vue({
    el: '.bookCatalog',
    data: {
        book: {},
        isAlive: false,
    }
    , watch: {
        list: function (newVal, oldVal) {
            this.isAlive = newVal.length > 0;
        }
    }
    , methods: {
        GoBottom: function (e) {
            let dom = e.target || e.toElement || e.srcElement;
            dom.parentElement.parentElement.scrollTop = dom.parentElement.parentElement.scrollHeight
        },
        GoReadBook: function (book, index) {
            bookRead.book = book;
            bookRead.CatalogIndex = index;
        }
    }
});
let bookRead = new Vue({
    el: ".bookRead",
    data: {
        book: {},
        CatalogIndex: -1,
        content: "",
        showMenu: false
    },
    methods: {
        TouchBook: function (event) {
            if (this.showMenu) {
                this.showMenu = false;
                return;
            }
            let dom = (event.target || event.srcElement);
            let x = event.layerX;
            let y = event.layerY;
            let w = dom.clientWidth;
            let h = dom.clientHeight;

            let type = TouchWhere(x, y, w, h, 3);

            switch (type) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    this.showMenu = true;
                    break;
                case 5:
                    break;
                case 6: {
                    dom.scrollTop -= h + 18;
                    if (dom.scrollTop === 0) {
                        this.menu(0);
                    }
                }
                    break;
                case 7:
                    break;
                case 8: {
                    let top = dom.scrollTop;
                    dom.scrollTop += h - 18;
                    if (dom.scrollTop === top) {
                        this.menu(2);
                    }
                }
                    break;
            }

        },
        menu: function (type) {
            switch (type) {
                case 0: {
                    if (this.CatalogIndex === 0) {
                        layer.msg("当前已经是第一章", {icon: 1});
                    } else {
                        this.CatalogIndex--;
                    }
                }
                    break;
                case 3: {
                    bookShelf.showCatalog(this.book, true);
                    this.CatalogIndex = -1;
                }
                    break;
                case 1: {
                    this.CatalogIndex = -1;
                }
                    break;
                case 2: {
                    if (this.CatalogIndex < this.book.catalog.length - 1) {
                        this.CatalogIndex++;
                    } else {
                        layer.msg("当前已经是最新一章", {icon: 1});
                    }
                }
                    break;
            }
        }
    },
    watch: {
        CatalogIndex: async function (newVal, oldVal) {
            this.showMenu = false;
            if (newVal > -1) {
                let index = layer.load(1, {
                    shade: [0.2, '#FFF'] //0.1透明度的白色背景,
                });
                // console.log(this.book.catalog[newVal]);
                this.content = await api.content(this.book.catalog[newVal]);
                this.book.CatalogIndex = newVal;
                DB.Update({
                    StoreArray: ["books"],
                    objectStore: "books",
                    data: this.book,
                    success: function (e) {
                    },
                    error: function (e) {
                    }
                });

                let content = this.$el.querySelector(".content");
                setTimeout(function () {
                    if (newVal > oldVal) {
                        content.scrollTop = 0;
                    } else {
                        content.scrollTop = content.scrollHeight;
                    }
                }, 10);
                layer.close(index);
            }
        }
    }
});

let api = new API(huanyue123, "http://127.0.0.1/ProxyCrossDomain/index.php");

let DB = new Database({
    DB: "book"
    , version: 1
    , ObjectStore: [
        {
            name: "books", keyPath: "title", Index: [
                {name: "title", key: "title", unique: true}
                , {name: "data", key: "data", unique: false}
                , {name: "catalog", key: "catalog", unique: false}
                , {name: "CatalogIndex", key: "CatalogIndex", unique: false}
            ]
        }
    ]
});
DB.ready = function () {
    bookShelf.UpdateData();
};
