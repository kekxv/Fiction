let huanyue123 = {
    mode:"huanyue123",
    url: "http://m.huanyue123.com/",
    search: function (keyword) {
        let self = this;
        return new Promise((resolve, reject) => {
            API.PutData(self.url + "s.php", JSON.stringify({"keyword": keyword, "t": 1}), function (data) {
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
                                title: dom.querySelector(".title").innerText,
                                catalog: [],
                                CatalogIndex: -1,
                                mode: self.mode,
                                data: {
                                    url: bookUrl,
                                    title: dom.querySelector(".title").innerText,
                                    author: _[0].innerText,
                                    state: _[1].innerText,
                                    image: "{url}/files/article/image/{bookUrl}/{id}s.jpg".format({
                                        url: self.url.replace("m.", "www."),
                                        bookUrl: _bookUrl.split("_").join("/"),
                                        id: _bookUrl.split("_").pop()
                                    }),
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
            API.GetData(`${self.url}${bookUrl}/all.html`, function (data) {
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
            API.GetData(`${self.url}${catalog.url}`, function (data) {
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
                    try{
                      chaptercontent.removeChild(chaptercontent.querySelector("div"));
                      chaptercontent.removeChild(chaptercontent.querySelector("p"));
                    }catch(e){
                      
                    }
                    let da = chaptercontent.innerHTML;
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
                    let synopsisArea_detail = box.querySelector(".synopsisArea_detail");
                    try {
                        book.state = synopsisArea_detail.querySelector("p.upchapter").innerText.trim();
                        book.time = synopsisArea_detail.querySelectorAll("p")[3].innerText.trim();
                    }catch (e) {

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