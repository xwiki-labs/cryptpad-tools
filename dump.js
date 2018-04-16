const Https = require('https');
const nThen = require('nthen');
const WebSocket = require('ws');
const requirejs = require('requirejs');
const Chainpad = require('./node_modules/chainpad/chainpad.dist.js');
const LineInputStream = require('line-input-stream');
const Nacl = require('./node_modules/tweetnacl/nacl-fast.js');
const Atob = require('atob');

const handleLine = (crypto, line, chainpad) => {
    const parsed = JSON.parse(line);
    if (parsed.validateKey && parsed.channel) { return; }
    const msg = parsed[4].replace(/^cp\|([A-Za-z0-9+\/=]+\|)?/, '');
    //console.log(msg);
    const decrypted = crypto.decrypt(msg, true, true);
    //console.log(decrypted);
    chainpad.message(decrypted);
};

// common-hash
requirejs.define('/customize/messages.js', ()=>{ return {}; });

requirejs._load = requirejs.load;
requirejs.load = function (context, moduleName, url) {
    url = url.replace(/^\/bower_components\//, 'node_modules/');
    url = url.replace(/^\/common\//, './node_modules/cryptpad/www/common/');
    url = url.replace(/^\/customize\//, './node_modules/cryptpad/customize.dist/');
    return requirejs._load(context, moduleName, url);
};

const getSecrets = module.exports.getSecrets = (padURL, callback) => {
    // chainpad-crypto
    global.nacl = Nacl;
    global.self = global.window = global;

    // common-util
    global.atob = Atob;

    let fileHost;

    const cpServer = padURL.replace(/(http[s]*:\/\/[^/]*)\/.*$/, (all, a) => a);
    nThen((w) => {
        const apiConfig = cpServer + '/api/config';
        Https.get(apiConfig, w((res) => {
            const dat = [];
            res.on('data', (d) => { dat.push(String(d)) });
            res.on('end', w(() => {
                const str = dat.join('');
                const f = new Function(['define'], str);
                f(w((x) => {
                    fileHost = x.fileHost;
                }))
            }));
        }));
    }).nThen((w) => {
        requirejs([
            './node_modules/cryptpad/www/common/common-hash.js'
        ], w((Hash) => {
            const hash = Hash.parsePadUrl(padURL);
            const secret = Hash.getSecrets(hash.hashData.type, hash.hash);
            const padFile = fileHost + '/datastore/' + secret.channel.slice(0,2) + '/' + secret.channel + '.ndjson';
            callback({ secret: secret, fileHost: fileHost, padFile: padFile });
        }));
    });
};

module.exports.mkChainpad = (padURL, callback) => {
    let secrets;
    let Crypto;
    nThen((w) => {
        getSecrets(padURL, w((s) => { secrets = s; }));
    }).nThen((w) => {
        requirejs([
            './node_modules/chainpad-crypto/crypto.js'
        ], w((_Crypto) => {
            Crypto = _Crypto;
        }));
    }).nThen((w) => {
        const secret = secrets.secret;
        const crypto = Crypto.createEncryptor(secret.keys);
        const chainpad = Chainpad.create({
            userName: 'dumper',
            initialState: '',
            //transformFunction: config.transformFunction,
            //patchTransformer: config.patchTransformer,
            //validateContent: config.validateContent,
            //avgSyncMilliseconds: config.avgSyncMilliseconds,
            logLevel: 1,
            noPrune: true
        });
        Https.get(secrets.padFile, (res) => {
            const lis = LineInputStream(res);
            lis.setEncoding("utf8");
            lis.setDelimiter("\n");
            lis.on('line', (l) => { handleLine(crypto, l, chainpad); });
            res.on('end', () => { callback(chainpad); });
        });
    });
};