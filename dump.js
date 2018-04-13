const Https = require('https');
const nThen = require('nthen');
const WebSocket = require('ws');
const requirejs = require('requirejs');

module.exports = (padURL, callback) => {

    // chainpad-crypto
    requirejs.define('/bower_components/tweetnacl/nacl-fast.min.js', ()=>{});
    global.nacl = require('./node_modules/tweetnacl/nacl-fast.js');
    global.self = global.window = global;

    // common-hash
    requirejs.define('/customize/messages.js', ()=>{ return {}; });

    // chainpad-netflux
    window.addEventListener = ()=>{};
    window.Chainpad = require('./node_modules/chainpad/chainpad.dist.js');

    // netflux-websocket
    window.WebSocket = WebSocket;
    requirejs.define('/bower_components/es6-promise/es6-promise.min.js', ()=>{});

    // common-util
    window.atob = require('atob');

    requirejs._load = requirejs.load;
    requirejs.load = function (context, moduleName, url) {
        url = url.replace(/^\/bower_components\//, 'node_modules/');
        url = url.replace(/^\/common\//, './node_modules/cryptpad/www/common/');
        url = url.replace(/^\/customize\//, './node_modules/cryptpad/customize.dist/');
        return requirejs._load(context, moduleName, url);
    };

    let websocketPath;
    nThen((w) => {
        const apiConfig = padURL.replace(/(http[s]*:\/\/[^/]*)\/.*$/, (all, a) => a) + '/api/config';
        Https.get(apiConfig, w((res) => {
            const dat = [];
            res.on('data', (d) => { dat.push(String(d)) });
            res.on('end', w(() => {
                const str = dat.join('');
                const f = new Function(['define'], str);
                f(w((x) => {
                    websocketPath = x.websocketPath;
                }))
            }));
        }));
    }).nThen((w) => {
        //requirejs.onError = (e) => { throw e.originalError; }
        requirejs([
            './node_modules/chainpad-netflux/chainpad-netflux.js',
            './node_modules/chainpad-crypto/crypto.js',
            './node_modules/cryptpad/www/common/common-hash.js',
            '/common/common-util.js'
        ], function (Realtime, Crypto, Hash, Util) {
            const hash = Hash.parsePadUrl(padURL);
            const secret = Hash.getSecrets(hash.hashData.type, hash.hash);
            var config = {
                initialState: '',
                channel: Util.base64ToHex(hash.hashData.channel),
                validateKey: secret.keys.validateKey || undefined,
                crypto: Crypto.createEncryptor(secret.keys),
                websocketURL: websocketPath,
                cryptKey: hash.hashData.key,
            };
            //config.onInit = function (info) { console.log('init') };
            config.onReady = function (info) {
                //const chainpad = info._;
                info.network.disconnect();
                info.realtime.abort();
                callback(info);
                //console.log('onReady', info);
            };
            //config.onRemote = function (info) { console.log('onRemote'); };
            config.onError = function (info) { try {throw new Error();}catch(e){console.log(e.stack)} };
            const rt = Realtime.start(config);
        });
    });
};