if (!window.biquguan)
    window.biquguan = {
        mode: "biquguan",
        title:"笔趣馆",
        url: "https://m.biquguan.com",
        ProxyUrl: "http://127.0.0.1/ProxyCrossDomain/",
        search: function (keyword) {
            let self = this;
            return new Promise((resolve, reject) => {
                API.PutData(`${self.url}/SearchBook.php`,{q:keyword}, function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let list = box.querySelectorAll(".hot_sale");
                        let da = [];
                        for (let i in list) {
                            if (list.hasOwnProperty(i)) {
                                let dom = list[i];
                                let _ = dom.querySelectorAll(".author");
                                let bookUrl = dom.querySelector("a").getAttribute("href");
                                let _bookUrl = bookUrl.replace(/^\/?([^\/]*)\/?$/g, "$1");
                                da.push({
                                    title: dom.querySelector(".title").innerText.replace(/\n/g, ''),
                                    catalog: [],
                                    CatalogIndex: -1,
                                    mode: self.mode,
                                    data: {
                                        url: bookUrl,
                                        title: dom.querySelector(".title").innerText.replace(/\n/g, ''),
                                        author: _[0].innerText.replace(/\n/g, ''),
                                        state: _[1].innerText.replace(/\n/g, ''),
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
                API.PutData(`${self.url}${bookUrl}/all.html`, {},function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let list = box.querySelectorAll("#chapterlist > p a");
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
                API.PutData(`${self.url}${catalog.url}`,{}, async function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<br\/><br\/>/g, "<br/>");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let chaptercontent = box.querySelector("#chaptercontent");
                        let pb_next = box.querySelector("#pb_next");
                        try {
                            chaptercontent.removeChild(chaptercontent.querySelector("div"));
                            chaptercontent.removeChild(chaptercontent.querySelector("p"));
                        } catch (e) {

                        }
                        let da = chaptercontent.innerHTML;
                        if (pb_next !== null && pb_next.innerText.indexOf("页") !== -1) {
                            let _ = {
                                title:catalog.title,
                                url:`${catalog.url.split('/').slice(0, -1).join('/')}/${pb_next.getAttribute("href")}`
                            };
                            da += await self.content(_)
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
        update: function (book) {
            let self = this;
            return new Promise((resolve, reject) => {
                API.PutData(`${self.url}${book.url}`,{}, function (data) {
                    if (data.Code === 0) {
                        let documentFragment = document.createDocumentFragment();
                        let box = document.createElement("div");
                        data.Result = data.Result.replace(/<br\/><br\/>/g, "<br/>");
                        data.Result = data.Result.replace(/<img([^>]*)>/g, "<img1$1>");
                        data.Result = data.Result.replace(/<script([^>]*)>/g, "<script1$1>");
                        data.Result = data.Result.replace(/<link([^>]*)>/g, "<link1$1>");
                        box.innerHTML = data.Result;
                        documentFragment.appendChild(box);
                        let synopsisArea_detail = box.querySelector(".synopsisArea_detail");
                        try {
                            book.image = synopsisArea_detail.querySelector("img1").getAttribute("src");
                            book.state = synopsisArea_detail.querySelectorAll("p")[4].innerText.replace(/\n/g, '').trim();
                            book.time = synopsisArea_detail.querySelectorAll("p")[3].innerText.replace(/\n/g, '').trim();
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