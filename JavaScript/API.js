let API = function (modes, proxyUrl) {
    if (!!proxyUrl) {
        API.prototype.$ProxyCrossDomainUrl = proxyUrl;
    }
    let defKey = null;
    for (let k in modes) {
        if (modes.hasOwnProperty(k)) {
            defKey = k;
            break;
        }
    }
    if (defKey == null) throw new Error("参数错误");
    Object.defineProperty(this, "$modes", {
        enumerable: false,
        configurable: false,
        get() {
            return modes;
        }
    });
    Object.defineProperty(this, "$defMode", {
        enumerable: false,
        configurable: false,
        get() {
            return this.$modes[defKey];
        }
    });
};

API.prototype = {
    search: async function (keyword,modeKey) {
        let mode = (modeKey && typeof modeKey === "string") ? this.$modes[modeKey] : this.$defMode;
        return mode.search(keyword);
    },
    catalog: async function (keyword, bookinfo) {
        let mode = (bookinfo && typeof bookinfo.mode === "string") ? this.$modes[bookinfo.mode] : this.$defMode;
        return mode.catalog(keyword);
    },
    content: async function (catalog, bookinfo) {
        let mode = (bookinfo && typeof bookinfo.mode === "string") ? this.$modes[bookinfo.mode] : this.$defMode;
        return mode.content(catalog);
    },
    update: async function (bookinfo) {
        let mode = (bookinfo && typeof bookinfo.mode === "string") ? this.$modes[bookinfo.mode] : this.$defMode;
        return mode.update(bookinfo.data);
    },
    $ProxyCrossDomainUrl: "",
    GetData: function (url, callback, err) {
        let headers = {};
        if (self.Token > 0) {
            // headers['Cookie'] = 'ess-token={Token}; '.format({Token: self.Token});
        }
        fetch("{0}?url={1}".format(API.prototype.$ProxyCrossDomainUrl, encodeURIComponent(url)),
            {
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                // credentials: 'include', // include, same-origin, *omit
                method: 'GET', // *GET, POST, PUT, DELETE, etc.
                headers: headers,
                mode: 'cors', // no-cors, cors, *same-origin
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // *client, no-referrer
            }
        )
            .then(function (response) {
                return response.json();
            }).then(callback || console.log).catch(err || console.log).catch(err || console.log)
    },
    PutData: function (url, data, callback, err) {
        let self = this;
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        if (self.Token > 0) {
            // headers['Cookie'] = 'ess-token={Token}; '.format({Token: self.Token});
        }
        if (typeof data === "object") {
            let s = "";
            for (let i in data) {
                if (!data.hasOwnProperty(i)) continue;
                if (s.length > 0) s += "&";
                s += "{key}={value}".format({key: i, value: encodeURIComponent(data[i])});
            }
            data = s;
        }
        fetch("{0}?url={1}".format(API.prototype.$ProxyCrossDomainUrl, encodeURIComponent(url)),
            {
                body: "data={data}".format({data: encodeURIComponent(data)}), // must match 'Content-Type' header
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                // credentials: 'include', // include, same-origin, *omit
                headers: headers,
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, cors, *same-origin
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // *client, no-referrer
            }
        )
            .then(function (response) {
                return response.json()
            }).then(callback || console.log).catch(err || console.log).catch(err || console.log)
    },
    PutJson: function (url, data, callback, err) {
        let self = this;
        let headers = {
            'Content-Type': 'application/json',
        };
        if (self.Token > 0) {
            // headers['Cookie'] = 'ess-token={Token}; '.format({Token: self.Token});
        }
        fetch("{0}?url={1}".format(API.prototype.$ProxyCrossDomainUrl, encodeURIComponent(url)),
            {
                body: JSON.stringify({
                    data: JSON.stringify(data),
                    isJson: true
                }), // must match 'Content-Type' header
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                // credentials: 'include', // include, same-origin, *omit
                headers: headers,
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, cors, *same-origin
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // *client, no-referrer
            }
        )
            .then(function (response) {
                return response.json()
            }).then(callback || console.log).catch(err || console.log).catch(err || console.log)
    }
};
API.GetData = API.prototype.GetData;
API.PutData = API.prototype.PutData;
API.PutJson = API.prototype.PutJson;

