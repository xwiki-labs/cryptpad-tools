const Https = require('https');
const Dump = require('./dump.js');

if (/^http[s]*:\/\/\.*/.test(process.argv[process.argv.length-1])) {
    Dump.getSecrets(process.argv[process.argv.length-1], (secrets) => {
        Https.get(secrets.padFile, (res) => {
            res.pipe(process.stdout);
        });
    });
} else {
    console.log("Usage: node download.js <full url of pad>");
    console.log("Outputs the content of the cryptpad data file from the server");
}