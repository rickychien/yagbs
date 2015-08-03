'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = main;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _confidant = require('confidant');

var _confidant2 = _interopRequireDefault(_confidant);

var _cfgManager = require('cfg-manager');

var _cfgManager2 = _interopRequireDefault(_cfgManager);

var _argparse = require('argparse');

var CWD_PATH = process.cwd();

var parser = new _argparse.ArgumentParser({
  version: require('../package').version,
  description: 'Yet another gaia build system',
  addHelp: true
});

parser.addArgument(['--dir'], {
  help: 'Where to search for configure.js build files',
  type: 'string',
  defaultValue: CWD_PATH
});

parser.addArgument(['--config'], {
  help: 'Where to search for configure.js build files',
  type: 'string',
  defaultValue: CWD_PATH
});

parser.addArgument(['--cache'], {
  help: 'Path to store',
  type: 'string',
  defaultValue: CWD_PATH
});

function isCacheModified(cachePath, config) {
  if (!_fs2['default'].existsSync(cachePath)) return false;

  var data = _fs2['default'].readFileSync(cachePath, { encoding: 'utf-8' });
  var cache = JSON.parse(data);
  return JSON.stringify(cache) !== JSON.stringify(config);
}

function main() {
  var args = arguments.length <= 0 || arguments[0] === undefined ? parser.parseArgs() : arguments[0];

  var cfg = new _cfgManager2['default']();
  var configPath = args.config + '/test/build-config.json';

  // Merge build-config with envrionment varialbes
  cfg.file(configPath).env();
  var config = cfg._config;

  var cachePath = args.cache + '/build-config-cache.json';
  var configString = JSON.stringify(config, null, 2);

  if (isCacheModified(cachePath, config)) {
    console.log('Execute confidant...');
    (0, _confidant2['default'])({
      dir: args.dir,
      exclude: 'bower_components,node_modules'
    });
  }

  _fs2['default'].writeFileSync(cachePath, configString);
}

module.exports = exports['default'];