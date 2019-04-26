let API = function (modes) {
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
        },
        set(v) {
            modes = v;
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
    search: function (keyword, modeKey) {
        let mode = (modeKey && typeof modeKey === "string") ? this.$modes[modeKey] : this.$defMode;
        if (!!mode.ProxyUrl) {
            API.prototype.$ProxyCrossDomainUrl = mode.ProxyUrl;
        }
        return mode.search(keyword);
    },
    catalog: function (keyword, bookinfo) {
        let mode = (bookinfo && typeof bookinfo.mode === "string") ? this.$modes[bookinfo.mode] : this.$defMode;
        if (!!mode.ProxyUrl) {
            API.prototype.$ProxyCrossDomainUrl = mode.ProxyUrl;
        }
        return mode.catalog(keyword);
    },
    content: function (catalog, bookinfo) {
        let mode = (bookinfo && typeof bookinfo.mode === "string") ? this.$modes[bookinfo.mode] : this.$defMode;
        if (!!mode.ProxyUrl) {
            API.prototype.$ProxyCrossDomainUrl = mode.ProxyUrl;
        }
        return mode.content(catalog);
    },
    update: function (bookinfo) {
        let mode = (bookinfo && typeof bookinfo.mode === "string") ? this.$modes[bookinfo.mode] : this.$defMode;
        if (!!mode.ProxyUrl) {
            API.prototype.$ProxyCrossDomainUrl = mode.ProxyUrl;
        }
        return mode.update(bookinfo.data);
    },
    $ProxyCrossDomainUrl: "",
    GetData: function (url, callback, err) {
        if (API.IsClient()) {
            NavigatorAPI.GetData(
                url,
                NavigatorCallback.pushCallback(function (...values) {
                    callback && callback(values[0]);
                }),
                NavigatorCallback.pushCallback(function (...values) {
                    err && err(values[0]);
                })
            );
            return;
        }
        let headers = {};
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
        let headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        if (typeof data === "object") {
            let s = "";
            for (let i in data) {
                if (!data.hasOwnProperty(i)) continue;
                if (s.length > 0) s += "&";
                s += "{key}={value}".format({key: i, value: encodeURIComponent(data[i])});
            }
            data = s;
        }
        if (API.IsClient()) {
            NavigatorAPI.PutData(
                url,
                JSON.stringify({
                    ContentType: headers["Content-Type"],
                    data: data
                }),
                NavigatorCallback.pushCallback(function (...values) {
                    callback && callback(values[0]);
                }),
                NavigatorCallback.pushCallback(function (...values) {
                    err && err(values[0]);
                })
            );
            return;
        }
        fetch("{0}".format(API.prototype.$ProxyCrossDomainUrl, encodeURIComponent(url)),
            {
                body: "url={url}&data={data}".format({data: encodeURIComponent(data), url: encodeURIComponent(url)}), // must match 'Content-Type' header
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
        if (API.IsClient()) {
            NavigatorAPI.PutJson(
                url,
                typeof data === "string" ? data : JSON.stringify(data),
                NavigatorCallback.pushCallback(function (...values) {
                    callback && callback(values[0]);
                }),
                NavigatorCallback.pushCallback(function (...values) {
                    err && err(values[0]);
                })
            );
            return;
        }
        let headers = {
            'Content-Type': 'application/json',
        };
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
    },

};
API.GetData = API.prototype.GetData;
API.PutData = API.prototype.PutData;
API.PutJson = API.prototype.PutJson;
API.GBKencodeURI = GBK.URI.encodeURI;

/**
 * @return {boolean}
 */
API.IsClient = function () {
    return window.NavigatorCallback !== undefined && window.NavigatorAPI !== undefined;
};
