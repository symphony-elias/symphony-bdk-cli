#!/usr/bin/env node

require = require('esm')(module /*, options*/);
require('../src/cli')(process.argv);
