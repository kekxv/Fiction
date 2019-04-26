if (!window.tianxiabachang)
    window.tianxiabachang = {
        mode: "tianxiabachang",
        title:"笔趣阁",
        url: "https://m.tianxiabachang.cn",
        ProxyUrl: "http://127.0.0.1/ProxyCrossDomain/",
        search: function (keyword) {
            let self = this;
            return new Promise((resolve, reject) => {
                API.GetData(`${self.url}/s.php?s=${keyword}`, function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let list = box.querySelectorAll("ul.fk li");
                        let da = [];
                        for (let i in list) {
                            if (list.hasOwnProperty(i)) {
                                let dom = list[i];
                                let _ = dom.querySelectorAll("a");
                                let bookUrl = _[1].getAttribute("href");
                                da.push({
                                    title: _[1].innerText.replace(/\n/g, ''),
                                    catalog: [],
                                    CatalogIndex: -1,
                                    mode: self.mode,
                                    data: {
                                        url: bookUrl,
                                        title: _[1].innerText.replace(/\n/g, ''),
                                        author: _[2].innerText.replace(/\n/g, ''),
                                        state: "",
                                        image: "",
                                    }
                                });
                            }
                        }
                        resolve(da);
                    } else {
                        reject(data.Message);
                    }
                }, function (errmess) {
                    reject(errmess);
                });
            });
        },
        catalog: function (bookUrl) {
            let self = this;
            return new Promise((resolve, reject) => {
                API.GetData(`${self.url}${bookUrl}`.replace("m.", "www."), function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let _list = box.querySelector("#list dl");
                        while (_list.hasChildNodes()) {
                            if (_list.firstChild.nodeName === "DT" && _list.firstChild.innerText.indexOf("正文") !== -1) {
                                _list.removeChild(_list.firstChild);
                                break;
                            }
                            _list.removeChild(_list.firstChild);
                        }
                        let list = _list.querySelectorAll("dd a");
                        let da = [];
                        for (let i in list) {
                            if (list.hasOwnProperty(i)) {
                                let dom = list[i];
                                let bookUrl = dom.getAttribute("href");
                                let title = dom.innerText;
                                if (title.indexOf("直达页面底部") !== -1) continue;
                                da.push({
                                    url: bookUrl,
                                    title: title,
                                });
                            }
                        }
                        resolve(da);
                    } else {
                        reject(data.Message);
                    }
                }, function (errmess) {
                    reject(errmess);
                });
            });
        },
        content: function (catalog) {
            let self = this;
            return new Promise((resolve, reject) => {
                API.GetData(`${self.url.replace("m.", "www.")}${catalog.url}`, function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<br\/><br\/>/g, "<br/>");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let chaptercontent = box.querySelector("#content");
                        let pb_next = box.querySelector("#pb_next");
                        try {
                            chaptercontent.removeChild(chaptercontent.querySelector("div"));
                            chaptercontent.removeChild(chaptercontent.querySelector("p"));
                        } catch (e) {

                        }
                        let da = chaptercontent.innerHTML;
                        if (pb_next !== null && pb_next.innerText.indexOf("页") !== -1) {
                            let _ = {
                                title: catalog.title,
                                url: `${catalog.url.split('/').slice(0, -1).join('/')}/${pb_next.getAttribute("href")}`
                            };
                            self.content(_).then((d)=>{
                                resolve(da+d);
                            })
                        }else {
                            resolve(da);
                        }
                    } else {
                        reject(data.Message);
                    }
                }, function (errmess) {
                    reject(errmess);
                });
            });
        },
        update: function (book) {
            let self = this;
            return new Promise((resolve, reject) => {
                API.GetData(`${self.url}${book.url}`, function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<br\/><br\/>/g, "<br/>");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let synopsisArea_detail = box.querySelector("#xinxi");
                        try {
                            book.image = synopsisArea_detail.querySelector("img1").getAttribute("src");
                            book.state = synopsisArea_detail.querySelectorAll("ul li")[3].innerText.replace(/\n/g, '').trim();
                            book.time = synopsisArea_detail.querySelectorAll("ul li")[4].innerText.replace(/\n/g, '').trim();
                        } catch (e) {
                            console.log(e);
                        }
                        resolve(book);
                    } else {
                        reject(data.Message);
                    }
                }, function (errmess) {
                    reject(errmess);
                });
            });
        }
    };