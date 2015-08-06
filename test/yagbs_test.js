import assert from 'assert';
import fs from 'fs';
import rimraf from 'rimraf';
import helper from './lib/helper';
import yagbs from '../src/yagbs';

suite('Yagbs', () => {

  let FIXTURES_DIR = `${process.cwd()}/test/fixtures`;
  let removes = [
    `${FIXTURES_DIR}/file-copy.txt`,
    `${FIXTURES_DIR}/build-config-cache.json`,
    `${FIXTURES_DIR}/build.ninja`,
    `${FIXTURES_DIR}/.ninja_deps`,
    `${FIXTURES_DIR}/.ninja_log`
  ];
  let options = {
    dir: FIXTURES_DIR,
    exclude: 'bower_components,node_modules',
    config: FIXTURES_DIR
  };
  let hook;

  setup(() => {
    hook = helper.captureStream(process.stdout);
  });

  teardown(() => {
    hook.unhook();
    removes.forEach(file => rimraf.sync(file));
  });

  test('#Execute yagbs once', () => {
    yagbs(options);
    assert.ok(fs.existsSync(`${FIXTURES_DIR}/build-config-cache.json`));
    assert.equal(hook.captured(),
`Configuring...
Building with Ninja...
`);
  });

  test('#Execute yagbs twice', () => {
    yagbs(options);
    yagbs(options);
    assert.ok(fs.existsSync(`${FIXTURES_DIR}/build-config-cache.json`));
    assert.equal(hook.captured(),
`Configuring...
Building with Ninja...
No operations need to perform for configuring.
Building with Ninja...
`);
  });

});
