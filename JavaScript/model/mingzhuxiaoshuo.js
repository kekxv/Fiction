if (!window.mingzhuxiaoshuo)
    window.mingzhuxiaoshuo = {
        mode: "mingzhuxiaoshuo",
        title:"名著小说",
        url: "http://www.mingzhuxiaoshuo.com",
        ProxyUrl: "http://127.0.0.1/ProxyCrossDomain/",
        search: function (keyword) {
            let self = this;
            return new Promise((resolve, reject) => {
                API.GetData(`${self.url}/Search.asp?s=${API.GBKencodeURI(keyword)}`, function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let table = box.querySelector(`table[width="100%"][bordercolorlight="#f7edd3"]`);
                        let list = table.querySelectorAll("tr:not([bgcolor])");
                        let da = [];
                        for (let i in list) {
                            if (list.hasOwnProperty(i)) {
                                let dom = list[i];
                                let _ = dom.querySelectorAll("td");
                                if(_.length <= 1){
                                    reject(_[0].innerText.replace(/\n/g, ''));
                                    return;
                                }
                                let bookUrl = _[0].querySelector("a").getAttribute("href");
                                da.push({
                                    title: _[0].innerText.replace(/\n/g, ''),
                                    catalog: [],
                                    CatalogIndex: -1,
                                    mode: self.mode,
                                    data: {
                                        url: bookUrl,
                                        title: _[0].innerText.replace(/\n/g, ''),
                                        author: _[2].innerText.replace(/\n/g, ''),
                                        state: `${_[4].innerText.replace(/\\n/g, '')}:${_[1].innerText.replace(/\n/g, '')}`,
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
                if(bookUrl.toLocaleLowerCase().indexOf(".html")){
                    bookUrl = bookUrl.split("/").slice(0,-1).join("/")
                }
                API.GetData(`${self.url}${bookUrl}/`,function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let list = box.querySelectorAll("li a[title]");
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
                API.GetData(`${self.url}${catalog.url}`, async function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<br\/><br\/>/g, "<br/>");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let content = box.querySelector(`div[class="width"]`);
                        content.innerHTML = content.innerHTML.replace(/<img1([^>]*)>/g, "<img$1>")
                            .replace(/<img +src="([^hH"]+)"([^>]*)>/g, `<img src="${self.url}\$1" \$2>`);
                        let p= content.querySelectorAll("p");
                        for(let i in p){
                            if(p.hasOwnProperty(i)){
                                p[i].style = "";
                            }
                        }
                        resolve(content.innerHTML);
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
                        try {
                            book.image = box.querySelector("table img1[alt][onerror]").getAttribute("src");
                            book.state = box.querySelector("table td.tuchuhuang12").innerText.replace(/\n/g, '').trim();
                            book.time = box.querySelector("table td.huikuang").innerText.split("|")[2].replace(/\n/g, '').trim();
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