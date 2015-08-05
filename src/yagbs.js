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

function hasNewerConfig(cachePath, config) {
  if (!fs.existsSync(cachePath)) return true;

  let data = fs.readFileSync(cachePath, { encoding: 'utf-8' });
  let cache = JSON.parse(data);
  return JSON.stringify(cache) !== JSON.stringify(config);
}

export default function main(args = parser.parseArgs()) {
  let dir = args.dir;
  let cfg = new CfgManger();
  let configPath = `${args.config}/build-config.json`;

  // Merge build-config with envrionment varialbes
  cfg.file(configPath).env();
  let config = cfg._config;

  let cachePath = `${args.cache}/build-config-cache.json`;
  let configString = JSON.stringify(config, null, 2);

  if (hasNewerConfig(cachePath, config)) {
    console.log('Configuring...');
    confidant({
      dir: dir,
      exclude: 'bower_components,node_modules'
    });
  } else {
    console.log('No operations need to perform configuring.');
  }

  if (fs.existsSync(`${dir}/build.ninja`)) {
    console.log('Building with Ninja...');
    child_process.exec('ninja', { cwd: dir }, (err, stdout, stderr) => {
      if (err) throw err;
    });
  }

  fs.writeFileSync(cachePath, configString);

  return true;
}
