import fs from 'fs';
import confidant from 'confidant';
import CfgManger from 'cfg-manager';
import { ArgumentParser } from 'argparse';
import { exec } from 'child-process-promise';

let CWD_PATH = process.cwd();

let parser = new ArgumentParser({
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
  if (!fs.existsSync(cachePath)) return true;

  let cache = JSON.parse(fs.readFileSync(cachePath, { encoding: 'utf-8' }));
  return JSON.stringify(cache) !== JSON.stringify(mergedConfig);
}

function building(dir) {
  return new Promise((resolve, reject) => {
    exec('ninja', { cwd: dir })
    .then(result => {
      resolve();
    })
    .fail(err => {
      console.error(err);
      reject(err);
    });
  });
}

function caching(cachePath, cache) {
  return new Promise((resolve, reject) => {
    fs.writeFile(cachePath, cache, err => {
      if (err) reject(err);
      resolve(cache);
    });
  });
}

export default function main(args = parser.parseArgs()) {
  let dir = args.dir;
  let exclude = args.exclude;
  let config = args.config;
  let cfg = new CfgManger();
  let configPath = `${config}/build-config.json`;
  let cachePath = `${config}/build-config-cache.json`;

  // Merge build-config with envrionment varialbes if it exists
  if (fs.existsSync(configPath)) {
    cfg.file(configPath);
  }

  cfg.env()
    .config({
      ARGUMENT_DIR: dir,
      ARGUMENT_EXCLUDE: exclude,
      ARGUMENT_CONFIG: config
    });

  let mergedConfig = cfg._config;

  return (hasNewerConfig(cachePath, mergedConfig) ?
    confidant({ dir: dir, exclude: exclude }) : Promise.resolve())
    .then(() => building(dir))
    .then(() => caching(cachePath, JSON.stringify(mergedConfig, null, 2)))
    .catch(err => {
      if (err.stdout) {
        console.error(err.stdout);
      } else {
        console.error(err);
      }
    });
}
