const Dump = require('./dump.js');

if (/^http[s]*:\/\/\.*/.test(process.argv[process.argv.length-1])) {
    Dump.mkChainpad(process.argv[process.argv.length-1], (realtime) => {
        console.log(realtime.getAuthDoc());
    });
} else {
    console.log("Usage: node getcontent.js <full url of pad>");
    console.log("Get the most recent version of the content of the pad");
}