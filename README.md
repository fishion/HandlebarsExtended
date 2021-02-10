


const path = require('path');
const appRoot = path.resolve(__dirname, '..');
const HBE = require('HandlebarsExtended')({
  appRoot : appRoot
});

const config = require(path.resolve(appRoot, 'config.json'));
HBE.buildSite(config)