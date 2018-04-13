# CryptPad Tools

Command line tools for interacting with and debugging cryptpad.

**NOTE**: This is still a work in progress, experiment at your own risk.

## dot.js

```bash
node ./dot.js <url of a given pad>
```

Syncs the chain of the pad and generates DOT language code for graphing the chain underlying the pad.

**CAUTION**: This does not sync the whole chain, only the part after the last 2 checkpoints, TODO: fix...