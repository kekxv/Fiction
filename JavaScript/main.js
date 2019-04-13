let jsVersionTime = 2019041314;
window.onload = async function () {
    let api = null;

    window.DB = new Database({
        DB: "book"
        , version: 3
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
        ],
        onupgradeneeded: function (db) {
            let self = this;
        }
    });

    await new Promise((resolve, reject) => {
        DB.ready = function () {
            resolve();
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

    async function UpdateModels() {
        let options = await new Promise((resolve, reject) => {
            let da = [];
            DB.ReadAll({
                StoreArray: ["booksSource"],
                objectStore: "booksSource",
                success: function (cursor, value) {
                    if (cursor) {
                        da.push(value)
                    } else {
                        resolve(da);
                    }
                    return true;
                }
            });
        });
        bookConfig.booksSources = options;
        let models = {};
        await new Promise((resolve, reject) => {
            let len = options.length;
            for (let i = 0; i < options.length; i++) {
                if (!options.hasOwnProperty(i)) continue;
                let option = options[i];
                loadScript(option.ModelUrl + "?v=" + jsVersionTime, function () {
                    models[option.Model] = Function(`return ${option.Model}`)();
                    models[option.Model].ProxyUrl = option.ProxyUrl || models[option.Model].ProxyUrl;
                    len--;
                    if (len === 0) {
                        resolve();
                    }
                });
            }
        });
        if (api === null) {
            api = new API(models);
        } else {
            api.$modes = models;
        }
        return models;
    }


    let urlParam = getUrlParam();

    let bookShelf = new Vue({
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
            showCatalog: async function (book, update) {
                let index = layer.load(1, {
                    shade: [0.2, '#FFF'] //0.1透明度的白色背景
                });
                if (window.navigator.onLine && !update) {
                    book.catalog = await api.catalog(book.data.url, book);
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
                            api.update(item).then(async function (bookinfo) {
                                try {
                                    let isUpdate = (!item.catalog || item.catalog.length === 0) || time.trim() !== bookinfo.time.trim();
                                    if (isUpdate) {
                                        item.data = bookinfo;
                                        item.catalog = await api.catalog(bookinfo.url, item);
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
                                    }
                                } catch (e) {

                                }
                                self.isUpdating--;
                            }).catch(function () {
                                self.isUpdating--;
                            });
                        }
                    }

                    bookShelf.search = false;
                    layer.close(index);
                });
            },
            UpdateBooksCache: async function (bookinfo) {
                if (bookinfo.CatalogIndex === undefined || bookinfo.CatalogIndex === -1) {
                    return;
                }
                let self = this;
                let _da = [];
                await new Promise((resolve, reject) => {
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
                });
                for (let i = _da.length; i < 4; i++) {
                    if (bookinfo.catalog && bookinfo.catalog.length > bookinfo.CatalogIndex + i) {
                        try {
                            let d = {
                                CatalogUrl: bookinfo.catalog[bookinfo.CatalogIndex + i].url,
                                title: bookinfo.title,
                                content: await api.content(bookinfo.catalog[bookinfo.CatalogIndex + i], bookinfo),
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
                        } catch (e) {
                            console.log(e);
                        }
                    } else {
                        break;
                    }
                }
            },
            searchBook: async function () {
                if (this.searchKeyword.length === 0) {
                    // search?'书架':'设置'
                    if (this.search) {
                        this.UpdateData();
                    } else {
                        bookConfig.isAlive = true;
                    }
                    return;
                }
                let index = layer.load(1, {
                    shade: [0.2, '#FFF'] //0.1透明度的白色背景
                });
                this.search = true;
                try {
                    this.list = await api.search(this.searchKeyword, this.modeKey);
                } catch (e) {
                    layer.msg("搜索失败");
                }
                // this.searchKeyword = "";
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
            DelBook:async function (data) {
                try {
                    await new Promise((resolve, reject) => {
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
                    });

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
                            }
                            return true;
                        }
                    });
                    bookShelf.UpdateData();
                }catch (e) {
                    
                }
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
                        this.modeKey = i;
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
    let bookCatalog = new Vue({
        el: '.bookCatalog',
        data: {
            book: {},
            isAlive: false,
        }
        , watch: {
            list: function (newVal, oldVal) {
                this.isAlive = newVal.length > 0;
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
    let bookRead = new Vue({
        el: ".bookRead",
        data: {
            book: {},
            CatalogIndex: -1,
            content: "",
            showMenu: false,
            catalog:null
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
                        }else{
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
                        }else{
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
                this.content = "";
                let self = this;
                if (newVal > -1) {
                    if (history.state == null) history.pushState({}, null, location.href);
                    let index = layer.load(1, {
                        shade: [0.2, '#FFF'] //0.1透明度的白色背景,
                    });
                    // console.log(this.book.catalog[newVal]);


                    self.catalog = await new Promise((resolve, reject) => {
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
                    });

                    if (self.catalog == null) {
                        self.catalog = {
                            CatalogUrl: this.book.catalog[newVal].url,
                            title: this.book.title,
                            content: await api.content(this.book.catalog[newVal], this.book),
                            CatalogIndex: newVal,
                            scrollTop: 0
                        };
                        this.content = self.catalog.content;
                        DB.Update({
                            StoreArray: ["booksCache"],
                            objectStore: "booksCache",
                            data: self.catalog,
                            success: function (e) {
                            },
                            error: function (e) {
                            }
                        });
                    } else {
                        this.content = self.catalog.content;
                    }
                    bookShelf.UpdateBooksCache(this.book);
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
                    content.querySelector("div").style.height = "unset";

                    setTimeout(function () {
                        let oH = content.scrollHeight;
                        let cH = content.clientHeight;
                        let pS = Math.ceil(oH / (cH - 18));
                        content.querySelector("div").style.height = ((cH - 18) * pS - 28) + "px";
                        // if (newVal > oldVal)
                        {
                            content.scrollTop = self.catalog.scrollTop || 0;
                        }
                        // else {
                        //     content.scrollTop = content.scrollHeight;
                        // }
                    }, 10);
                    layer.close(index);
                }
            },
            content:function (newVal,oldVal) {

            }
        }
    });

    let bookConfig = new Vue({
        el: ".bookConfig",
        data: {
            isAlive: false,
            booksSources: [],
        },
        methods: {
            delSources: function (item) {
                // console.log(item);
                layer.msg("暂不支持删除");
            },
            addSource: async function () {
                let isYes = false;
                try {
                    let option = await new Promise((resolve, reject) => {
                        //页面层
                        layer.open({
                            type: 1
                            , title: '添加新源'
                            , skin: 'layui-layer-lan'
                            , anim: 5 //动画类型
                            , btn: ['确定']
                            , area: ['90%', 'auto']  //宽高
                            , content: `<div class="BookConfig">
                        <label>
                        <input name="ProxyUrl" placeholder="代理地址" value="${urlParam.ProxyUrl || ''}" title="例如：http://localhost/ProxyCrossDomain/index.php"></label>
                        <label>
                        <input name="ModelUrl" placeholder="插件地址" value="${urlParam.ModelUrl || ''}" title="例如：http://localhost/Fiction/JavaScript/model/huanyue123.js"></label>
                        <label>
                        <input name="Model" placeholder="插件变量" value="${urlParam.Model || ''}" title="例如：huanyue123"></label>
                        </div>`
                            , yes: function (index, layerer) {
                                isYes = true;
                                layer.close(index);
                                let option = {
                                    ProxyUrl: layerer[0].querySelector("input[name='ProxyUrl'").value,
                                    ModelUrl: layerer[0].querySelector("input[name='ModelUrl'").value,
                                    Model: layerer[0].querySelector("input[name='Model'").value,
                                };
                                if (!option.ProxyUrl || !option.ModelUrl || !option.Model) {
                                    isYes = false;
                                    return;
                                }
                                resolve(option);
                            }
                            , end: function () {
                                if (!isYes) {
                                    reject();
                                }
                            }
                        });
                    });

                    DB.Add({
                        StoreArray: ["booksSource"],
                        objectStore: "booksSource",
                        data: option,
                        success: function (e) {
                            layer.msg('添加书源成功。。', {icon: 1}, function () {
                                location.reload();
                            });
                        },
                        error: function (e) {
                            layer.msg('添加书源失败。。', {icon: 2});
                        }
                    });

                    // await UpdateModels();
                } catch (e) {
                    // console.log(e);
                }
            },
            putSources: async function (item) {
                let isYes = false;
                try {
                    let option = await new Promise((resolve, reject) => {
                        //页面层
                        layer.open({
                            type: 1
                            , title: '修改书源'
                            , skin: 'layui-layer-lan'
                            , anim: 5 //动画类型
                            , btn: ['确定']
                            , area: ['90%', 'auto']  //宽高
                            , content: `<div class="BookConfig">
                        <label>
                        <input name="ProxyUrl" placeholder="代理地址" value="${item.ProxyUrl}"></label>
                        <label>
                        <input name="ModelUrl" placeholder="插件地址" value="${item.ModelUrl}"></label>
                        <label>
                        <input name="Model" placeholder="插件变量" disabled readonly value="${item.Model}"></label>
                        </div>`
                            , yes: function (index, layerer) {
                                isYes = true;
                                layer.close(index);
                                let option = {
                                    ProxyUrl: layerer[0].querySelector("input[name='ProxyUrl'").value,
                                    ModelUrl: layerer[0].querySelector("input[name='ModelUrl'").value,
                                    Model: layerer[0].querySelector("input[name='Model'").value,
                                };
                                if (!option.ProxyUrl || !option.ModelUrl || !option.Model) {
                                    isYes = false;
                                    return;
                                }
                                resolve(option);
                            }
                            , end: function () {
                                if (!isYes) {
                                    reject();
                                }
                            }
                        });
                    });

                    DB.Update({
                        StoreArray: ["booksSource"],
                        objectStore: "booksSource",
                        data: option,
                        success: function (e) {
                            layer.msg('更新书源成功。。', {icon: 1}, function () {
                                location.reload();
                            });
                        },
                        error: function (e) {
                            layer.msg('更新书源成功。。', {icon: 2});
                        }
                    });

                    // await UpdateModels();
                } catch (e) {
                    // console.log(e);
                }
            }
        },
        watch: {
            isAlive: function (newVal, oldVal) {
                if (newVal) {
                    if (!history.state) {
                        history.pushState({}, null, location.href);
                    }
                }
            }
        }
    });

    window.bookShelf = bookShelf;
    window.bookCatalog = bookCatalog;
    window.bookRead = bookRead;
    window.bookConfig = bookConfig;

    DB.ready = async function () {
        bookShelf.booksSource = await UpdateModels();
        bookShelf.UpdateData();
    };

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
        if (!history.state && bookConfig.isAlive) {
            bookConfig.isAlive = false;
            return;
        }
        bookShelf.search = false;
        // console.log(event);
    });

};
