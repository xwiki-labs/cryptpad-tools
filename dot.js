const Dump = require('./dump.js');

const chainToDot = function (chainpad) {
    const out = [
        'digraph {'
    ];
    const parseBlock = function (x) {
        let c = x.getChildren();
        let label = x.hashOf.slice(0,8) + ' (' + x.parentCount + ' - ' + x.recvOrder + ')';
        const p = x.getParent();
        if (p && p.getChildren().length === 1 && c.length === 1) {
            label = '...';
            let gc = c;
            while (gc.length === 1) {
                c = gc;
                gc = c[0].getChildren();
            }
        }
        const nodeInfo = ['  p' + x.hashOf + '[label="' + label + '"'];
        if (x.isCheckpoint && label !== '...') { nodeInfo.push(',color=red,weight=0.5'); }
        nodeInfo.push(']');
        out.push(nodeInfo.join(''));
        c.forEach(function (child) {
            out.push('  p' + x.hashOf + ' -> p' + child.hashOf);
            parseBlock(child);
        });
    };
    parseBlock(chainpad.getRootBlock());
    out.push('}');
    return out.join('\n');
};

if (/^http[s]*:\/\/\.*/.test(process.argv[process.argv.length-1])) {
    Dump(process.argv[process.argv.length-1], (info) => {
        console.log(chainToDot(info.realtime));
        info.realtime.abort();
        //console.log('done');
        //console.log(info);
    });
} else {
    console.log("Usage: node dot.js <full url of pad>");
    console.log("Creates a DOT language representation of the pad graph");
}