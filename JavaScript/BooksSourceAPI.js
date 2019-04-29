/**
 * 首字为 $ 为获取节点数组
 * $$ 数组下标
 * @ 表示 attribute
 * @Text 表示 innerText
 * @HTML 表示 innerHtml
 *
 * type 1 文本 2 图片、文本 3 视频
 *
 */

//

let BooksSourceAPI = function (DB,cb) {
    let self = this;
    let modes = [];
    Object.defineProperty(this, "modes", {
        enumerable: true,
        configurable: false,
        get() {
            return modes;
        }
    });

    DB.ready = function () {
        DB.ReadAll({
            StoreArray: ["BooksSource"],
            objectStore: "BooksSource",
            success: function (cursor, value) {
                if (cursor) {
                    modes.push(value);
                }else{
                    cb && cb.call(self,modes);
                }
                return true;
            }
        });
    }
};
BooksSourceAPI.prototype = {
    Type: "新书源引擎",
    /**
     * 搜索
     * @param keyword 搜索关键字
     * @param mode 书源模型
     * @constructor
     */
    Search: function (keyword, mode) {
        let self = this;
        let Mode = self.GetMode(mode);
        return new Promise(((resolve, reject) => {
            if (Mode === null) {
                reject("未找到书源");
                return;
            }
            API.prototype.$ProxyCrossDomainUrl = Mode.ProxyUrl;
            let err = function (errmess) {
                reject(errmess);
            };
            let callback = function (data) {
                if (data.Code !== 0) {
                    reject(data.Message);
                    return;
                }
                let documentFragment = document.createDocumentFragment();
                let box = document.createElement("div");
                data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                box.innerHTML = data.Result;
                documentFragment.appendChild(box);
                if (Mode.search.selector[0] === '$') {
                    Mode.search.selector = Mode.search.selector.substring(1);
                }
                let list = box.querySelectorAll(Mode.search.selector);
                let da = [];
                let searchData = Mode.search.data;
                for (let i in list) {
                    if (list.hasOwnProperty(i)) {
                        let dom = list[i];
                        let title = self.GetNode(searchData.title, dom);
                        let _d = {
                            title: title,
                            catalog: [],
                            CatalogIndex: -1,
                            mode: Mode.Model,
                            data: {
                                url: self.GetNode(searchData.url, dom),
                                title: title,
                                author: self.GetNode(searchData.author, dom),
                                state: self.GetNode(searchData.state, dom),
                                image: "",
                            }
                        };
                        da.push(_d);
                    }
                }
                resolve(da);
            };
            if (Mode.search.IsPost === true) {
                API.PutData(
                    Mode.search.url,
                    JSON.parse(Mode.search.Data.format({
                            keyword: Mode.isGBK ?
                                API.GBKencodeURI(keyword) : keyword
                        })
                    ),
                    callback,
                    err
                )
            } else {
                API.GetData(
                    Mode.search.url.format({
                        keyword: Mode.isGBK ?
                            API.GBKencodeURI(keyword) : keyword
                    }),
                    callback,
                    err
                )
            }
        }));

    },
    /**
     * 获取目录
     * @param book 书结构
     * @param mode 书源模型
     * @constructor
     */
    Catalog: function (book, mode) {
        let self = this;
        let bookUrl = book.data.url;
        let urlPath = bookUrl.substring(0, bookUrl.lastIndexOf("/") + 1) || bookUrl;
        let Mode = self.GetMode(book.mode || mode);
        return new Promise(((resolve, reject) => {
            if (Mode === null) {
                reject("未找到书源");
                return;
            }
            API.prototype.$ProxyCrossDomainUrl = Mode.ProxyUrl;
            let err = function (errmess) {
                reject(errmess);
            };
            let callback = function (data) {
                if (data.Code !== 0) {
                    reject(data.Message);
                    return;
                }
                let documentFragment = document.createDocumentFragment();
                let box = document.createElement("div");
                data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1/>");
                data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1/>");
                data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1/>");
                box.innerHTML = data.Result;
                documentFragment.appendChild(box);
                if (Mode.catalog.selector[0] === '$') {
                    Mode.catalog.selector = Mode.catalog.selector.substring(1);
                }
                let list = box.querySelectorAll(Mode.catalog.selector);

                if (Mode.catalog.screenSelector && Mode.catalog.screen) {
                    for (let _1 in list) {
                        if (!list.hasOwnProperty(_1)) continue;
                        let _ = list[_1];
                        _.remove();
                        if (_.innerText.indexOf(Mode.catalog.screen) !== -1) {
                            break;
                        }
                    }
                    list = box.querySelectorAll(Mode.catalog.selector);
                }
                let da = [];
                let catalogData = Mode.catalog.data;
                for (let i in list) {
                    if (list.hasOwnProperty(i)) {
                        let dom = list[i];
                        // let title = self.GetNode(catalogData.title, dom);
                        let _d = {
                            url: self.GetNode(catalogData.url, dom),
                            title: self.GetNode(catalogData.title, dom)
                        };

                        if (_d.url.indexOf('/') === -1) {
                            _d.url = urlPath + _d.url;
                        }
                        da.push(_d);
                    }
                }
                resolve(da);
            };
            if (Mode.catalog.IsPost === true) {
                API.PutData(
                    Mode.catalog.url.format({
                        url: bookUrl,
                        urlPath: urlPath,
                    }),
                    JSON.parse((Mode.catalog.Data || "{}").format({
                            url: bookUrl,
                            urlPath: urlPath
                        })
                    ),
                    callback,
                    err
                )
            } else {
                API.GetData(
                    Mode.catalog.url.format({
                        url: bookUrl,
                        urlPath: urlPath
                    }),
                    callback,
                    err
                )
            }
        }));
    },
    /**
     * 获取书页
     * @param book 书结构
     * @param catalog 目录
     * @param mode 书源模型
     * @constructor
     */
    Content: function (book, catalog, mode) {
        let self = this;
        let bookUrl = book.data.url;
        let Mode = self.GetMode(book.mode || mode);
        return new Promise(((resolve, reject) => {
            if (Mode === null) {
                reject("未找到书源");
                return;
            }
            API.prototype.$ProxyCrossDomainUrl = Mode.ProxyUrl;
            let err = function (errmess) {
                reject(errmess);
            };
            let callback = function (data) {
                if (data.Code !== 0) {
                    reject(data.Message);
                    return;
                }
                let documentFragment = document.createDocumentFragment();
                let box = document.createElement("div");
                data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1/>");
                data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1/>");
                data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1/>");
                box.innerHTML = data.Result;
                documentFragment.appendChild(box);

                let Content = "";


                if (Mode.content.selector[0] === '$') {
                    Mode.content.selector = Mode.content.selector.substring(1);
                    try {
                        let list = box.querySelectorAll(Mode.content.selector);
                        for (let i in list) {
                            Content += list[i].innerHTML + "\n";
                        }
                    } catch (e) {
                        reject(e);
                        return;
                    }
                } else {
                    try {
                        Content = box.querySelector(Mode.content.selector).innerHTML;
                    } catch (e) {
                        reject(e);
                        return;
                    }
                }
                if (Mode.content.type > 1) {
                    Content = Content.replace(/<img1([^>]*)\/?>.*(<\/img1>)?/g, "<img$1>").replace(/<img +src="([^hH"]+)"([^>]*)>/g, `<img src="${Mode.url}\$1" \$2>`);
                }
                if (!!Mode.content.pbNext && self.GetNode(Mode.content.pbNext, box) !== null) {
                    let _url = self.GetNode(Mode.content.pbNext, box);
                    let _key = self.GetNode(Mode.content.pbNextKey.selector, box);
                    if (_key.indexOf(Mode.content.pbNextKey.screen) !== -1) {
                        if (_url.indexOf('/') === -1) {
                            _url = catalog.url.split('/').slice(0, -1).join('/') + "/" + _url;
                        }
                        self.Content(book, {
                            url: _url,
                            title: catalog.title
                        }, Mode.Model).then((data) => {
                            resolve(Content + data);
                        });
                        return;
                    }
                }
                resolve(Content);

            };
            if (Mode.content.IsPost === true) {
                API.PutData(
                    Mode.content.url.format({
                        url: catalog.url,
                        bookUrl: bookUrl
                    }),
                    JSON.parse((Mode.content.Data || "{}").format({
                            url: catalog.url,
                            bookUrl: bookUrl
                        })
                    ),
                    callback,
                    err
                )
            } else {
                API.GetData(
                    Mode.content.url.format({
                        url: catalog.url,
                        bookUrl: bookUrl
                    }),
                    callback,
                    err
                )
            }
        }));
    },
    /**
     * 获取更新
     * @param book 书
     * @param mode 书源模型
     * @constructor
     */
    Update: function (book, mode) {
        let self = this;
        let bookUrl = book.data.url;
        let Mode = self.GetMode(book.mode || mode);
        return new Promise(((resolve, reject) => {
            if (Mode === null) {
                reject("未找到书源");
                return;
            }
            API.prototype.$ProxyCrossDomainUrl = Mode.ProxyUrl;
            let err = function (errmess) {
                reject(errmess);
            };
            let callback = function (data) {
                if (data.Code !== 0) {
                    reject(data.Message);
                    return;
                }
                let documentFragment = document.createDocumentFragment();
                let box = document.createElement("div");
                data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1/>");
                data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1/>");
                data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1/>");
                box.innerHTML = data.Result;
                documentFragment.appendChild(box);

                let synopsisArea_detail = Mode.update.selector ? box.querySelector(Mode.update.selector) : box;
                try {
                    book.data.image = self.GetNode(Mode.update.data.image, synopsisArea_detail);
                    book.data.state = self.GetNode(Mode.update.data.state, synopsisArea_detail);
                    book.data.time = self.GetNode(Mode.update.data.time, synopsisArea_detail);
                } catch (e) {
                    reject(e);
                    return;
                }
                resolve(book.data);
            };
            if (Mode.update.IsPost === true) {
                API.PutData(
                    Mode.update.url.format({
                        url: bookUrl
                    }),
                    JSON.parse((Mode.update.Data || "{}").format({
                            url: bookUrl
                        })
                    ),
                    callback,
                    err
                )
            } else {
                API.GetData(
                    Mode.update.url.format({
                        url: bookUrl
                    }),
                    callback,
                    err
                )
            }
        }));
    },


    /**
     * @return {null| Object}
     */
    GetMode: function (mode) {
        let Mode = null;
        if (mode === undefined && this.modes.length > 0) {
            Mode = this.modes[0];
        } else {
            let modes = this.modes;
            for (let m in modes) {
                if (!modes.hasOwnProperty(m)) continue;
                if (modes[m].Model === mode) {
                    Mode = modes[m];
                    break;
                }
            }
        }
        return Mode;
    },
    /**
     * @return {null|string}
     */
    GetNode: function (selector, dom) {
        let selector_reg = /[#a-zA-Z_ 0-9.\[\]:^()"'=%]*/;
        if (!selector) return null;
        if (dom === null || dom === undefined) return null;
        selector = selector.replace(/img/g, "img1");
        if (selector[0] === "$") {
            selector = selector.substring(1);
            let _selector = selector_reg.exec(selector)[0];
            if (_selector !== "") {
                selector = selector.substring(_selector.length);
                if (selector.length < 3 || selector[0] !== "$" || selector[1] !== "$") {
                    return null;
                }
                let _ = (/^\$\$([0-9]*)/.exec(selector)[1]);
                let _1 = parseInt(_);
                if (isNaN(_1)) return null;
                try {
                    dom = dom.querySelectorAll(_selector)[_1];
                    if (dom === null || dom === undefined) return null;
                    selector = selector.substring(2 + _.length);
                } catch (e) {
                    return null;
                }
            }
            return this.GetNode(selector, dom);
        } else {
            let _selector = selector_reg.exec(selector)[0];
            if (_selector !== "") {
                try {
                    dom = dom.querySelector(_selector);
                    if (dom === null || dom === undefined) return null;
                    selector = selector.substring(_selector.length);
                } catch (e) {
                    return null;
                }
            }
            if (selector[0] === "@") {
                switch (selector.toLocaleLowerCase()) {
                    case "@text":
                        return dom.innerText.replace(/\n/g, '').trim();
                    case "@html":
                        return dom.innerHTML;
                    default:
                        return dom.getAttribute(selector.substring(1));
                }
            } else {
                return this.GetNode(selector, dom);
            }
        }
    }
};
