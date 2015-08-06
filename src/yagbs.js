import fs from 'fs';
import child_process from 'child_process';
import confidant from 'confidant';
import CfgManger from 'cfg-manager';
import { ArgumentParser } from 'argparse';

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

  if (hasNewerConfig(cachePath, mergedConfig)) {
    console.log('Configuring...');
    confidant({
      dir: dir,
      exclude: exclude
    });
  } else {
    console.log('No operations need to perform for configuring.');
  }

  if (fs.existsSync(`${dir}/build.ninja`)) {
    console.log('Building with Ninja...');
    child_process.exec('ninja', { cwd: dir }, (err, stdout, stderr) => {
      if (err) throw err;
    });
  }

  fs.writeFileSync(cachePath, JSON.stringify(cfg._config, null, 2));

  return true;
}
