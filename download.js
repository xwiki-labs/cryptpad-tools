const Https = require('https');
const Dump = require('./dump.js');

if (/^http[s]*:\/\/\.*/.test(process.argv[process.argv.length-1])) {
    
    Dump.getSecrets(process.argv[process.argv.length-1], (secrets) => {
        // console.log('secrets',secrets)
        Https.get(secrets.padFile, (res) => {
            res.pipe(process.stdout);
            if (res.statusCode !== 200) {
                console.error("ERR: statusCode:",res.statusCode)
                console.error("ERR: Server such as cryptpad.rf may restrict access to pad file based on origin/referrer. cryptPad file:",secrets.padFile)
            }
        });
    });
} else {
    console.log("Usage: node download.js <full url of pad>");
    console.log("Outputs the content of the cryptpad data file from the server");
}