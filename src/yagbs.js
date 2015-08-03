import fs from 'fs';
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
  if (!fs.existsSync(cachePath)) return false;

  let data = fs.readFileSync(cachePath, { encoding: 'utf-8' });
  let cache = JSON.parse(data);
  return JSON.stringify(cache) !== JSON.stringify(config);
}

export default function main(args = parser.parseArgs()) {
  let cfg = new CfgManger();
  let configPath = `${args.config}/test/build-config.json`;

  // Merge build-config with envrionment varialbes
  cfg.file(configPath).env();
  let config = cfg._config;

  let cachePath = `${args.cache}/build-config-cache.json`;
  let configString = JSON.stringify(config, null, 2);

  if (isCacheModified(cachePath, config)) {
    console.log('Execute confidant...');
    confidant({
      dir: args.dir,
      exclude: 'bower_components,node_modules'
    });
  }

  fs.writeFileSync(cachePath, configString);
}
