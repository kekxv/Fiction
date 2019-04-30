let jsVersionTime = 2019042201;
let api = null;
let booksSourceAPI = null;
window.onload = function () {
    let bookShelf;
    let bookCatalog;
    let bookRead;

    Promise.prototype.finally = Promise.prototype.finally || function (fn) {
        function finFn(valueORreason) {
            fn.call(null)
        }

        this.then(finFn, finFn);
        return this
    };


    window.DB = new Database({
        DB: "book"
        , version: 12
        , ObjectStore: [
            {
                name: "books", keyPath: "title", Index: [
                    {name: "title", key: "title", unique: true}
                    , {name: "data", key: "data", unique: false}
                    , {name: "catalog", key: "catalog", unique: false}
                    , {name: "CatalogIndex", key: "CatalogIndex", unique: false}
                ]
            },
            {
                name: "booksCache", keyPath: "CatalogUrl", Index: [
                    {name: "CatalogUrl", key: "CatalogUrl", unique: true}
                    , {name: "title", key: "title", unique: false}
                    , {name: "content", key: "content", unique: false}
                    , {name: "CatalogIndex", key: "CatalogIndex", unique: false}
                ]
            },
            {
                name: "booksSource", keyPath: "ModelUrl", Index: [
                    {name: "ModelUrl", key: "ModelUrl", unique: true}
                    , {name: "Model", key: "Model", unique: true}
                    , {name: "ProxyUrl", key: "ProxyUrl", unique: false}
                ]
            },
            {
                name: "BooksSource", keyPath: "Model", Index: [
                    {name: "Model", key: "Model", unique: true}
                    , {name: "Name", key: "Name", unique: false}
                    , {name: "ProxyUrl", key: "ProxyUrl", unique: false}
                ]
            },
        ],
        onupgradeneeded: function (db) {
            let self = this;

            let modes = [
                {
                    Name: "笔趣阁",
                    Model: "m.tianxiabachang.cn",
                    url: "https://m.tianxiabachang.cn",
                    ProxyUrl: "https://proxycrossdomain.kekxv.com/",
                    isGBK: false,
                    search: {
                        url: "https://m.tianxiabachang.cn/s.php?s={{keyword}}",
                        IsPost: false,
                        selector: "$ul.fk li",
                        Data: "{}",
                        data: {
                            url: "$a$$1@href",
                            title: "$a$$1@Text",
                            author: "$a$$2@Text",
                            time: "",
                            state: "",
                            image: "",
                        }
                    },
                    catalog: {
                        url: "https://www.tianxiabachang.cn{{url}}",
                        selector: "$#list dl>*",
                        screen: "正文",
                        screenSelector: "@Text",
                        data: {
                            url: "a@href",
                            title: "a@Text",
                        }
                    },
                    content: {
                        url: "https://www.tianxiabachang.cn/{{url}}",
                        selector: "#content",
                        pbNext: "#pb_next@href",
                        pbNextKey: {selector: "#pb_next@Text", screen: "页"},
                        data: "@innerHtml",
                        type: 1
                    },
                    update: {
                        url: "https://m.tianxiabachang.cn/{{url}}",
                        selector: "#xinxi",
                        data: {
                            time: "$ul li$$4@Text",
                            state: "$ul li$$3@Text",
                            image: "img@src",
                        }
                    },
                },
                {
                    Name: "笔趣馆",
                    Model: "m.biquguan.com",
                    url: "https://m.biquguan.com",
                    ProxyUrl: "https://proxycrossdomain.kekxv.com/",
                    isGBK: false,
                    search: {
                        url: "https://m.biquguan.com/SearchBook.php",
                        IsPost: true,
                        selector: "$.hot_sale",
                        Data: JSON.stringify({q: "{{keyword}}"}),
                        data: {
                            url: "a@href",
                            title: ".title@Text",
                            author: "$.author$$0@Text",
                            time: "",
                            state: "$.author$$1@Text",
                            image: "",
                        }
                    },
                    catalog: {
                        url: "https://m.biquguan.com/{{url}}/all.html",
                        selector: "#chapterlist > p a",
                        screen: "直达页面底部",
                        screenSelector: "@Text",
                        data: {
                            url: "@href",
                            title: "@Text",
                        }
                    },
                    content: {
                        url: "https://m.biquguan.com/{{url}}",
                        selector: "#chaptercontent",
                        pbNext: "#pb_next@href",
                        pbNextKey: {selector: "#pb_next@Text", screen: "页"},
                        data: "@innerHtml",
                        type: 1
                    },
                    update: {
                        url: "https://m.biquguan.com/{{url}}",
                        selector: ".synopsisArea_detail",
                        data: {
                            time: "$p$$4@Text",
                            state: "$p$$3@Text",
                            image: "img@src",
                        }
                    },
                },
                {
                    Name: "名著小说",
                    Model: "www.mingzhuxiaoshuo.com",
                    url: "http://www.mingzhuxiaoshuo.com",
                    ProxyUrl: "https://proxycrossdomain.kekxv.com/",
                    isGBK: true,
                    search: {
                        url: "http://www.mingzhuxiaoshuo.com/Search.asp?s={{keyword}}",
                        IsPost: false,
                        selector: "$table[width=\"100%\"][bordercolorlight=\"#f7edd3\"] tr:not([bgcolor])",
                        Data: JSON.stringify({}),
                        data: {
                            url: "$td$$0a@href",
                            title: "$td$$0@Text",
                            author: "$td$$2@Text",
                            time: "",
                            state: "$td$$4@Text",
                            image: "",
                        }
                    },
                    catalog: {
                        url: "http://www.mingzhuxiaoshuo.com/{{urlPath}}",
                        selector: "li a[title]",
                        data: {
                            url: "@href",
                            title: "@Text",
                        }
                    },
                    content: {
                        url: "http://www.mingzhuxiaoshuo.com/{{url}}",
                        selector: "div[class=\"width\"]",
                        pbNext: "#pb_next@href",
                        pbNextKey: {selector: "#pb_next@Text", screen: "页"},
                        data: "@innerHtml",
                        type: 2
                    },
                    update: {
                        url: "http://www.mingzhuxiaoshuo.com/{{url}}",
                        selector: "",
                        data: {
                            time: "table td.huikuang",
                            state: "table td.tuchuhuang12@Text",
                            image: "table img[alt][onerror]@src",
                        }
                    },
                },
                {
                    Name: "幻月书院",
                    Model: "m.huanyue123.com",
                    url: "http://m.huanyue123.com",
                    ProxyUrl: "https://proxycrossdomain.kekxv.com/",
                    isGBK: false,
                    search: {
                        url: "http://m.huanyue123.com/s.php",
                        IsPost: true,
                        selector: "$.hot_sale",
                        Data: JSON.stringify({keyword: "{{keyword}}"}),
                        data: {
                            url: "a@href",
                            title: ".title@Text",
                            author: "$.author$$1@Text",
                            time: "",
                            state: "$.author$$0@Text",
                            image: "",
                        }
                    },
                    catalog: {
                        url: "http://m.huanyue123.com/{{url}}/all.html",
                        selector: "$#chapterlist > p a",
                        screen: "直达页面底部",
                        screenSelector: "@Text",
                        data: {
                            url: "@href",
                            title: "@Text",
                        }
                    },
                    content: {
                        url: "http://m.huanyue123.com/{{url}}",
                        selector: "#chaptercontent",
                        data: "@innerHtml",
                        type: 1
                    },
                    update: {
                        url: "http://m.huanyue123.com/{{url}}",
                        selector: ".synopsisArea_detail",
                        data: {
                            time: "$p$$3@Text",
                            state: "p.upchapter@Text",
                            image: "img@src",
                        }
                    },
                },
                {
                    Name: "零点看书",
                    Model: "m.lingdiankanshu.co",
                    url: "https://m.lingdiankanshu.co/",
                    ProxyUrl: "https://proxycrossdomain.kekxv.com/",
                    isGBK: false,
                    search: {
                        url: "https://m.lingdiankanshu.co/SearchBook.php?q={{keyword}}",
                        IsPost: false,
                        selector: "$.hot_sale",
                        Data: JSON.stringify({q: "{{keyword}}"}),
                        data: {
                            url: "a@href",
                            title: ".title@Text",
                            author: "$.author$$0@Text",
                            time: "",
                            state: "$.author$$1@Text",
                            image: "",
                        }
                    },
                    catalog: {
                        url: "https://m.lingdiankanshu.co/{{url}}/all.html",
                        selector: "#chapterlist > p a:not([style^='color'])",
                        data: {
                            url: "@href",
                            title: "@Text",
                        }
                    },
                    content: {
                        url: "https://m.lingdiankanshu.co/{{url}}",
                        selector: "#chaptercontent",
                        pbNext: "#pb_next@href",
                        pbNextKey: {selector: "#pb_next@Text", screen: "页"},
                        data: "@innerHtml",
                        type: 1
                    },
                    update: {
                        url: "https://m.lingdiankanshu.co/{{url}}",
                        selector: ".synopsisArea_detail",
                        data: {
                            time: "$p$$4@Text",
                            state: "$p$$3@Text",
                            image: "img@src",
                        }
                    },
                },
            ];
            self.ready = function () {

                DB.ReadAll({
                    StoreArray: ["books"],
                    objectStore: "books",
                    success: function (cursor, value) {
                        if (cursor) {
                            for (let m in modes) {
                                if (!modes.hasOwnProperty(m)) continue;
                                if (modes[m].Model.indexOf(value.mode) !== -1) {
                                    value.mode = modes[m].Model;
                                    DB.Update({
                                        StoreArray: ["books"],
                                        objectStore: "books",
                                        data: value,
                                        success: function (e) {
                                        },
                                        error: function (e) {
                                        }
                                    });
                                    break;
                                }
                            }
                        } else {
                        }
                        return true;
                    }
                });

                for (let i in modes) {
                    if (!modes.hasOwnProperty(i)) continue;
                    let mode = modes[i];

                    self.Update({
                        StoreArray: ["BooksSource"],
                        objectStore: "BooksSource",
                        data: mode,
                        success: function (e) {
                            // layer.msg('添加成功。。', {icon: 1});
                        },
                        error: function (e) {
                            // layer.msg('添加失败,已存在书架中。。', {icon: 2});
                        }
                    });
                }
            }
        }
    });

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

    function loadScript(url, callback) {
        callback = typeof callback === 'function' ? callback : function () {
        };
        let head = document.getElementsByTagName('head')[0];
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onreadystatechange = function (e) {
            if (this.readyState === "loaded" || this.readyState === "complete") {
                callback(e);
            }
        };
        script.onload = callback;
        head.appendChild(script);
    }

    function getUrlParam() {
        //返回当前 URL 的查询部分（问号 ? 之后的部分）。
        const urlParameters = location.search;
        //声明并初始化接收请求参数的对象
        const requestParameters = {};
        //如果该求青中有请求的参数，则获取请求的参数，否则打印提示此请求没有请求的参数
        if (urlParameters.indexOf('?') !== -1) {
            //获取请求参数的字符串
            var parameters = decodeURI(urlParameters.substr(1));
            //将请求的参数以&分割中字符串数组
            parameterArray = parameters.split('&');
            //循环遍历，将请求的参数封装到请求参数的对象之中
            for (var i = 0; i < parameterArray.length; i++) {
                requestParameters[parameterArray[i].split('=')[0]] = (parameterArray[i].split('=')[1]);
            }
        }
        return requestParameters;
    }

    DB.ready = function () {

        booksSourceAPI = new BooksSourceAPI(DB, function (models) {
            api = new API(this);

            bookShelf.booksSource = models;
            bookShelf.UpdateData();
        });

        let urlParam = getUrlParam();

        bookShelf = new Vue({
            el: ".bookShelf",
            data: {
                search: false,
                isUpdating: 0,
                list: [],
                booksSource: [],
                modeKey: "",
                searchKeyword: ""
            },
            methods: {
                showCatalog: function (book, update) {
                    let index = layer.load(1, {
                        shade: [0.2, '#FFF'] //0.1透明度的白色背景
                    });
                    if (window.navigator.onLine && !update) {
                        api.catalog(book).finally(function () {
                            layer.close(index);
                        }).then(function (catalog) {
                            book.catalog = catalog;
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
                            bookCatalog.book = book;
                        }).catch(function (e) {
                            layer.msg('出现错误:' + e, {icon: 2});
                        })
                    } else if (book.catalog.length === 0) {
                        layer.msg('请检查网络。。', {icon: 2});
                    } else {
                        bookCatalog.book = book;
                    }
                    layer.close(index);
                },
                ReadBook: function (book) {
                    book.CatalogIndex = book.CatalogIndex === undefined ? -1 : book.CatalogIndex;
                    if (book.CatalogIndex < 0) {
                        this.showCatalog(book, book.catalog.length > 0);
                        return;
                    }
                    bookRead.book = book;
                    bookRead.CatalogIndex = book.CatalogIndex;
                },
                UpdateData: function () {
                    let self = this;
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
                                self.isUpdating++;
                                let item = bookShelf.list[i];
                                let time = item.data.time;
                                api.update(item).finally(function () {
                                    self.isUpdating--;
                                }).then(function (bookinfo) {
                                    try {
                                        let isUpdate = (!item.catalog || item.catalog.length === 0) || time.trim() !== bookinfo.time.trim();
                                        if (isUpdate) {
                                            api.catalog(item).then(function (catalog) {
                                                item.data = bookinfo;
                                                item.catalog = catalog;
                                                layer.msg(`《${bookinfo.title}》有更新。。`, {icon: 1});
                                                DB.Update({
                                                    StoreArray: ["books"],
                                                    objectStore: "books",
                                                    data: item,
                                                    success: function (e) {
                                                        self.UpdateBooksCache(item);
                                                    },
                                                    error: function (e) {
                                                        layer.msg('更新失败。。', {icon: 2});
                                                    }
                                                });
                                            })
                                        }
                                    } catch (e) {

                                    }
                                }).catch(function () {
                                    self.isUpdating--;
                                });
                            }
                        }

                        bookShelf.search = false;
                        layer.close(index);
                    });
                },
                UpdateBooksCache: function (bookinfo) {
                    if (bookinfo.CatalogIndex === undefined || bookinfo.CatalogIndex === -1) {
                        return;
                    }
                    let self = this;
                    let _da = [];
                    new Promise((resolve, reject) => {
                        DB.ReadAll({
                            StoreArray: ["booksCache"],
                            objectStore: "booksCache",
                            key: bookinfo.title,
                            index: "title",
                            success: function (cursor, value) {
                                if (cursor) {
                                    if (value.CatalogIndex < bookinfo.CatalogIndex) {
                                        DB.Remove({
                                            StoreArray: ["booksCache"],
                                            objectStore: "booksCache",
                                            key: value.CatalogUrl,
                                            success: function (result) {
                                            },
                                            error: function (result) {
                                            }
                                        });
                                    } else if (value.CatalogIndex > bookinfo.CatalogIndex + 4) {

                                    } else {
                                        _da.push(value)
                                    }
                                } else {
                                    resolve(_da);
                                }
                                return true;
                            }
                        });
                    }).then(function () {
                        for (let i = _da.length; i < 4; i++) {
                            if (bookinfo.catalog && bookinfo.catalog.length > bookinfo.CatalogIndex + i) {
                                api.content(bookinfo.catalog[bookinfo.CatalogIndex + i], bookinfo).then(function (content) {
                                    let d = {
                                        CatalogUrl: bookinfo.catalog[bookinfo.CatalogIndex + i].url,
                                        title: bookinfo.title,
                                        content: content,
                                        CatalogIndex: bookinfo.CatalogIndex + i
                                    };
                                    DB.Update({
                                        StoreArray: ["booksCache"],
                                        objectStore: "booksCache",
                                        data: d,
                                        success: function (e) {
                                        },
                                        error: function (e) {
                                        }
                                    });
                                }).catch(function (e) {
                                    console.log(e);
                                });
                            } else {
                                break;
                            }
                        }
                    });
                },
                /**
                 * @return {boolean}
                 */
                AddMode: function (mode) {
                    if (!mode.hasOwnProperty("Name")) return false;
                    if (!mode.hasOwnProperty("Model")) return false;
                    if (!mode.hasOwnProperty("url")) return false;
                    if (!mode.hasOwnProperty("search")) return false;
                    if (!mode.hasOwnProperty("catalog")) return false;
                    if (!mode.hasOwnProperty("content")) return false;
                    if (!mode.hasOwnProperty("update")) return false;
                    if (!mode.search.hasOwnProperty("url")) return false;
                    if (!mode.search.hasOwnProperty("selector")) return false;
                    if (!mode.search.hasOwnProperty("data")) return false;
                    if (!mode.search.data.hasOwnProperty("url")) return false;
                    if (!mode.search.data.hasOwnProperty("title")) return false;
                    if (!mode.catalog.hasOwnProperty("url")) return false;
                    if (!mode.catalog.hasOwnProperty("selector")) return false;
                    if (!mode.catalog.hasOwnProperty("data")) return false;
                    if (!mode.catalog.data.hasOwnProperty("url")) return false;
                    if (!mode.catalog.data.hasOwnProperty("title")) return false;
                    if (!mode.content.hasOwnProperty("url")) return false;
                    if (!mode.content.hasOwnProperty("selector")) return false;
                    if (!mode.content.hasOwnProperty("data")) return false;
                    if (!mode.update.hasOwnProperty("url")) return false;
                    if (!mode.update.hasOwnProperty("selector")) return false;
                    if (!mode.update.hasOwnProperty("data")) return false;
                    if (!mode.update.data.hasOwnProperty("time")) return false;
                    if (!mode.update.data.hasOwnProperty("state")) return false;


                    self.Update({
                        StoreArray: ["BooksSource"],
                        objectStore: "BooksSource",
                        data: mode,
                        success: function (e) {
                            // layer.msg('添加成功。。', {icon: 1});
                        },
                        error: function (e) {
                            // layer.msg('添加失败,已存在书架中。。', {icon: 2});
                        }
                    });

                    return true;
                },
                ImportMode: function () {
                    let self = this;
                    layer.open({
                        id: 1,
                        type: 1,
                        title: '导入书源',
                        area: ['90%', 'auto'],

                        content: `<div style="padding: 0.5em;"><p>粘贴导入：</p><p><textarea style="width: 100%;border: 1px solid #000;min-height: 250px;"></textarea></p></div>`
                        ,
                        btn: ['保存', '取消'],
                        btn1: function (index, layero) {
                            let mode = layero.find("textarea").val();
                            if (!mode) {
                                layer.msg("未输入任何数据");
                                return;
                            }
                            try {
                                let count = 0;
                                let modes = JSON.parse(mode);
                                if (modes instanceof Array) {
                                    for (let i in modes) {
                                        if (modes.hasOwnProperty(i)) {
                                            count += self.AddMode(modes[i]) ? 1 : 0;
                                        }
                                    }
                                } else if (modes instanceof Object) {
                                    count += self.AddMode(modes) ? 1 : 0;
                                }
                                layer.msg("成功添加或更新 [ {{0}} ] 个书源".format(count));
                            } catch (e) {
                                layer.msg("格式错误");
                            }
                        },
                        btn2: function (index, layero) {
                            layer.close(index);
                        }

                    });
                },
                reload: function () {
                    location.reload();
                },
                searchBook: function () {
                    if (this.searchKeyword.length === 0) {
                        return;
                    }
                    let index = layer.load(1, {
                        shade: [0.2, '#FFF'] //0.1透明度的白色背景
                    });
                    this.search = true;
                    let self = this;
                    api.search(this.searchKeyword, this.modeKey).finally(function () {
                        layer.close(index);
                    }).then(function (list) {
                        self.list = list;
                    }).catch(function (e) {
                        layer.msg("搜索失败");
                    });
                    // this.searchKeyword = "";
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
                    new Promise((resolve, reject) => {
                        DB.Remove({
                            StoreArray: ["books"],
                            objectStore: "books",
                            key: data.title,
                            success: function (result) {
                                resolve()
                            },
                            error: function (result) {
                                reject();
                            }
                        });
                    }).then(function () {
                        DB.ReadAll({
                            StoreArray: ["booksCache"],
                            objectStore: "booksCache",
                            key: data.title,
                            index: "title",
                            success: function (cursor, value) {
                                if (cursor) {
                                    DB.Remove({
                                        StoreArray: ["booksCache"],
                                        objectStore: "booksCache",
                                        key: value.CatalogUrl,
                                        success: function (result) {
                                        },
                                        error: function (result) {
                                        }
                                    });
                                } else {
                                    location.reload()
                                }
                                return true;
                            }
                        });
                        // bookShelf.UpdateData();
                    }).catch(function (e) {

                    })

                },

            },
            watch: {
                search: function (newVal, oldVal) {
                    if (newVal) {
                        if (!history.state) {
                            history.pushState({}, null, location.href);
                        }
                    } else {
                        this.UpdateData();
                        this.searchKeyword = "";
                    }
                },
                booksSource: function (newVal, oldVal) {
                    for (let i in newVal) {
                        if (newVal.hasOwnProperty(i)) {
                            this.modeKey = newVal[i].Model;
                            break;
                        }
                    }
                },
                modeKey: function (newVal, oldVal) {
                    if (this.search && !newVal) {
                        console.log(newVal);
                    }
                }
            }
        });
        bookCatalog = new Vue({
            el: '.bookCatalog',
            data: {
                book: {},
                isAlive: false,
            }
            , watch: {
                book: function (newVal, oldVal) {
                    let self = this;
                    if (newVal.catalog && newVal.catalog.length > 0) {
                        if (newVal.CatalogIndex !== undefined) {
                            setTimeout(function () {
                                self.$el.querySelector(".bookCatalog_Catalog").parentElement.scrollTop = newVal.CatalogIndex * 35;
                            }, 1);
                        }
                    }
                },
                isAlive: function (newVal, oldVal) {
                    if (newVal) {
                        if (history.state == null) history.pushState({}, null, location.href);
                    }
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
            },
        });
        bookRead = new Vue({
            el: ".bookRead",
            data: {
                book: {},
                CatalogIndex: -1,
                content: "",
                showMenu: false,
                catalog: null
            },
            methods: {
                TouchBook: function (event) {
                    if (this.showMenu) {
                        this.showMenu = false;
                        return;
                    }
                    let dom = (event.currentTarget || event.target || event.srcElement);
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
                            let flag = dom.scrollTop === 0;
                            dom.scrollTop -= h + 18;
                            if (flag && dom.scrollTop === 0) {
                                this.menu(0);
                            } else {
                                this.catalog.scrollTop = dom.scrollTop;
                                DB.Update({
                                    StoreArray: ["booksCache"],
                                    objectStore: "booksCache",
                                    data: this.catalog,
                                    success: function (e) {
                                    },
                                    error: function (e) {
                                    }
                                });
                            }
                        }
                            break;
                        case 7:
                        case 8: {
                            let top = dom.scrollTop;
                            dom.scrollTop += h - 18;
                            if (dom.scrollTop === top) {
                                this.menu(2);
                            } else {
                                this.catalog.scrollTop = dom.scrollTop;
                                DB.Update({
                                    StoreArray: ["booksCache"],
                                    objectStore: "booksCache",
                                    data: this.catalog,
                                    success: function (e) {
                                    },
                                    error: function (e) {
                                    }
                                });
                            }
                        }
                            break;
                    }

                },
                menu: function (type) {
                    let self = this;
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
                        case 4: { // 刷新当前章节

                            api.content(this.book.catalog[self.CatalogIndex], this.book).then(function (content) {
                                self.content = "";
                                self.catalog = {
                                    CatalogUrl: self.book.catalog[self.CatalogIndex].url,
                                    title: self.book.title,
                                    content: content,
                                    CatalogIndex: self.CatalogIndex,
                                    scrollTop: 0
                                };
                                self.content = self.catalog.content;
                                DB.Update({
                                    StoreArray: ["booksCache"],
                                    objectStore: "booksCache",
                                    data: self.catalog,
                                    success: function (e) {
                                    },
                                    error: function (e) {
                                    }
                                });
                            });
                        }
                            break;
                    }
                }
            },
            watch: {
                CatalogIndex: function (newVal, oldVal) {
                    this.showMenu = false;
                    this.content = "";
                    let self = this;
                    if (newVal > -1) {
                        if (history.state == null) history.pushState({}, null, location.href);
                        let index = layer.load(1, {
                            shade: [0.2, '#FFF'] //0.1透明度的白色背景,
                        });


                        new Promise((resolve, reject) => {
                            DB.ReadAll({
                                StoreArray: ["booksCache"],
                                objectStore: "booksCache",
                                key: this.book.catalog[newVal].url,
                                success: function (cursor, value) {
                                    if (cursor) {
                                        resolve(value);
                                        return false;
                                    } else {
                                        resolve(null);
                                    }
                                    return true;
                                }
                            });
                        }).then(function (catalog) {

                            let content = self.$el.querySelector(".content");
                            content.querySelector("div").style.height = "auto";

                            self.catalog = catalog;
                            if (self.catalog == null) {
                                api.content(self.book.catalog[newVal], self.book).then(function (Content) {
                                    self.catalog = {
                                        CatalogUrl: self.book.catalog[newVal].url,
                                        title: self.book.title,
                                        content: Content,
                                        CatalogIndex: newVal,
                                        scrollTop: 0
                                    };
                                    self.content = self.catalog.content;
                                    DB.Update({
                                        StoreArray: ["booksCache"],
                                        objectStore: "booksCache",
                                        data: self.catalog,
                                        success: function (e) {
                                        },
                                        error: function (e) {
                                        }
                                    });
                                    bookShelf.UpdateBooksCache(self.book);
                                    self.book.CatalogIndex = newVal;
                                    DB.Update({
                                        StoreArray: ["books"],
                                        objectStore: "books",
                                        data: self.book,
                                        success: function (e) {
                                        },
                                        error: function (e) {
                                        }
                                    });

                                    setTimeout(function () {
                                        let oH = content.scrollHeight;
                                        let cH = content.clientHeight;
                                        let pS = Math.ceil(oH / (cH - 18));
                                        content.querySelector("div").style.height = ((cH - 18) * pS - 28) + "px";
                                        if (oldVal + 1 === newVal) {
                                            content.scrollTop = 0;
                                        } else {
                                            content.scrollTop = self.catalog.scrollTop || 0;
                                        }
                                        layer.close(index);
                                    }, 200);
                                });
                            } else {
                                self.content = self.catalog.content;
                                bookShelf.UpdateBooksCache(self.book);
                                self.book.CatalogIndex = newVal;
                                DB.Update({
                                    StoreArray: ["books"],
                                    objectStore: "books",
                                    data: self.book,
                                    success: function (e) {
                                    },
                                    error: function (e) {
                                    }
                                });


                                setTimeout(function () {
                                    let oH = content.scrollHeight;
                                    let cH = content.clientHeight;
                                    let pS = Math.ceil(oH / (cH - 18));
                                    content.querySelector("div").style.height = ((cH - 18) * pS - 28) + "px";
                                    if (oldVal + 1 === newVal) {
                                        content.scrollTop = 0;
                                    } else {
                                        content.scrollTop = self.catalog.scrollTop || 0;
                                    }
                                    layer.close(index);
                                }, 200);
                            }
                        }).catch(function () {
                            layer.close(index);
                        });
                    }
                },
                content: function (newVal, oldVal) {

                }
            }
        });


        window.bookShelf = bookShelf;
        window.bookCatalog = bookCatalog;
        window.bookRead = bookRead;


        //拦截安卓回退按钮
        // history.pushState(null, null, location.href);
        window.addEventListener('popstate', function (event) {
            if (!history.state && bookRead.CatalogIndex !== -1) {
                bookRead.CatalogIndex = -1;
                if (bookCatalog.book.catalog && bookCatalog.book.catalog.length > 0)
                    history.pushState({}, null, location.href);
                return;
            }
            if (!history.state && bookCatalog.book.catalog && bookCatalog.book.catalog.length > 0) {
                bookCatalog.book = {};
                if (bookShelf.search)
                    history.pushState({}, null, location.href);
                return;
            }
            bookShelf.search = false;
            // console.log(event);
        });
    }

};
