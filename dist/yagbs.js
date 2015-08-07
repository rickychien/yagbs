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

var _childProcessPromise = require('child-process-promise');

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

parser.addArgument(['--exclude'], {
  help: 'Optional comma separated list of directories to omit from fs scan',
  type: 'string',
  defaultValue: 'bower_components,node_modules'
});

parser.addArgument(['--config'], {
  help: 'Where to search for build-config.json and build-config-cache.json',
  type: 'string',
  defaultValue: CWD_PATH
});

function hasNewerConfig(cachePath, mergedConfig) {
  if (!_fs2['default'].existsSync(cachePath)) return true;

  var cache = JSON.parse(_fs2['default'].readFileSync(cachePath, { encoding: 'utf-8' }));
  return JSON.stringify(cache) !== JSON.stringify(mergedConfig);
}

function building(dir) {
  return new Promise(function (resolve, reject) {
    (0, _childProcessPromise.exec)('ninja', { cwd: dir }).then(function (result) {
      resolve();
    }).fail(function (err) {
      console.error(err);
      reject(err);
    });
  });
}

function caching(cachePath, cache) {
  return new Promise(function (resolve, reject) {
    _fs2['default'].writeFile(cachePath, cache, function (err) {
      if (err) reject(err);
      resolve(cache);
    });
  });
}

function main() {
  var args = arguments.length <= 0 || arguments[0] === undefined ? parser.parseArgs() : arguments[0];

  var dir = args.dir;
  var exclude = args.exclude;
  var config = args.config;
  var cfg = new _cfgManager2['default']();
  var configPath = config + '/build-config.json';
  var cachePath = config + '/build-config-cache.json';

  // Merge build-config with envrionment varialbes if it exists
  if (_fs2['default'].existsSync(configPath)) {
    cfg.file(configPath);
  }

  cfg.env().config({
    ARGUMENT_DIR: dir,
    ARGUMENT_EXCLUDE: exclude,
    ARGUMENT_CONFIG: config
  });

  var mergedConfig = cfg._config;

  return (hasNewerConfig(cachePath, mergedConfig) ? (0, _confidant2['default'])({ dir: dir, exclude: exclude }) : Promise.resolve()).then(function () {
    return building(dir);
  }).then(function () {
    return caching(cachePath, JSON.stringify(mergedConfig, null, 2));
  })['catch'](function (err) {
    if (err.stdout) {
      console.error(err.stdout);
    } else {
      console.error(err);
    }
  });
}

module.exports = exports['default'];