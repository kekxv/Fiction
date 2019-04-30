let DATA_CACHE_NAME = 'Fiction-v4';
let CACHE_NAME = 'Fiction-5';
let IsDebug = false;
let filesToCache = [
    './',
    './index.html',

    './JavaScript/class/jquery.min.js',
    './JavaScript/class/vue.js',
    './JavaScript/class/vconsole.min.js',
    './JavaScript/class/Tools.js',
    './JavaScript/class/JsNotification.js',
    './JavaScript/class/gbk.js',
    './JavaScript/class/Database.js',
    './JavaScript/class/avalon.js',
    './JavaScript/class/layer/mobile/layer.js',
    './JavaScript/class/layer/mobile/need/layer.css',
    './JavaScript/class/layer/theme/default/loading-2.gif',
    './JavaScript/class/layer/theme/default/loading-1.gif',
    './JavaScript/class/layer/theme/default/loading-0.gif',
    './JavaScript/class/layer/theme/default/layer.css',
    './JavaScript/class/layer/theme/default/icon-ext.png',
    './JavaScript/class/layer/theme/default/icon.png',
    './JavaScript/class/layer/layer.js',

    './JavaScript/API.js',
    './JavaScript/BooksSourceAPI.js',
    './JavaScript/main.js',

    './styles/inline.css',
    './styles/class/bootcss.buttons.css',
    './styles/class/font-awesome-4.7.0/css/font-awesome.css',
    './styles/class/font-awesome-4.7.0/css/font-awesome.min.css',
    './styles/class/font-awesome-4.7.0/fonts/FontAwesome.otf',
    './styles/class/font-awesome-4.7.0/fonts/fontawesome-webfont.eot',
    './styles/class/font-awesome-4.7.0/fonts/fontawesome-webfont.svg',
    './styles/class/font-awesome-4.7.0/fonts/fontawesome-webfont.ttf',
    './styles/class/font-awesome-4.7.0/fonts/fontawesome-webfont.woff',
    './styles/class/font-awesome-4.7.0/fonts/fontawesome-webfont.woff2',


    './images/ic_launcher.png',
    './images/defaultCover.svg',
    './images/book_bg.jpg',
];

self.addEventListener('install', function (e) {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            console.log('[ServiceWorker] Caching app shell');
            return cache.addAll(filesToCache);
        }));
});

self.addEventListener('activate', function (e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (IsDebug || (key !== DATA_CACHE_NAME && key !== CACHE_NAME)) {
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        }));
    /*
     * Fixes a corner case in which the app wasn't returning the latest data.
     * You can reproduce the corner case by commenting out the line below and
     * then doing the following steps: 1) load app for first time so that the
     * initial New York City data is shown 2) press the refresh button on the
     * app 3) go offline 4) reload the app. You expect to see the newer NYC
     * data, but you actually see the initial data. This happens because the
     * service worker is not yet activated. The code below essentially lets
     * you activate the service worker faster.
     */
    return self.clients.claim();
});

self.addEventListener('fetch', function (evt) {
    // CODELAB: Add fetch event handler here.
    if (evt.request.url.toLocaleLowerCase().includes('ProxyCrossDomain'.toLocaleLowerCase())) {
        console.log('[Service Worker] Fetch (data)', evt.request.url);
        // evt.respondWith(
        //     caches.open(DATA_CACHE_NAME).then((cache) => {
        //         return fetch(evt.request)
        //             .then((response) => {
        //                 // If the response was good, clone it and store it in the cache.
        //                 if (response.status === 200) {
        //                     cache.put(evt.request.url, response.clone());
        //                 }
        //                 return response;
        //             }).catch((err) => {
        //                 // Network request failed, try to get it from the cache.
        //                 return cache.match(evt.request);
        //             });
        //     }));
        return;
    }
    evt.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(evt.request)
                .then((response) => {
                    return response || fetch(evt.request);
                });
        })
    );
});