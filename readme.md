# CryptPad Tools

Command line tools for interacting with and debugging cryptpad.

## dot.js

```bash
node ./dot.js <url of a given pad>
```

Syncs the chain of the pad and generates DOT language code for graphing the chain underlying the pad.

## download.js

```bash
node ./download.js <url of a given pad>
```

Dumps the file as it is stored on the server (with entire history).

## getcontent.js

```bash
node ./getcontent.js <url of a given pad>
```

Sync the chain and print the most recent version of the content of the pad.