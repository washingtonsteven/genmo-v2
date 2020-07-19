// This file is used for the `yarn bundle` command
// This de-moduleifies Genmo and inserts it onto the global object
// whether it is `global` or `window` or whatever.

const { Genmo } = require("./index");

globalThis.Genmo = Genmo;
