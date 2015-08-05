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
    config: FIXTURES_DIR,
    cache: FIXTURES_DIR
  };
  let hook;

  setup(() => {
    removes.forEach(file => rimraf.sync(file));
    hook = helper.captureStream(process.stdout);
  });

  teardown(() => {
    hook.unhook();
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
No operations need to perform configuring.
Building with Ninja...
`);
  });

});
