import assert from 'assert';
import fs from 'fs';
import rimraf from 'rimraf';
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

  teardown(() => {
    removes.forEach(file => rimraf.sync(file));
  });

  test('#Execute yagbs once', done => {
    yagbs(options)
      .then(() => {
        assert.ok(fs.existsSync(`${FIXTURES_DIR}/build-config-cache.json`),
          'build-config-cache.json should exist');
        assert.ok(fs.existsSync(`${FIXTURES_DIR}/build.ninja`),
          'build.ninja should exist');
        assert.ok(fs.existsSync(`${FIXTURES_DIR}/file-copy.txt`),
          'file-copy should exist');
        done();
      });
  });

  test('#Execute yagbs twice', done => {
    let mtime;

    yagbs(options)
      .then(() => {
        mtime = fs.statSync(`${FIXTURES_DIR}/build.ninja`).mtime.getTime();
        return yagbs(options);
      })
      .then(() => {
        assert.ok(fs.existsSync(`${FIXTURES_DIR}/build-config-cache.json`),
          'build-config-cache.json should exist');
        assert.ok(fs.existsSync(`${FIXTURES_DIR}/build.ninja`),
          'build.ninja should exist');
        assert.ok(fs.existsSync(`${FIXTURES_DIR}/file-copy.txt`),
          'file-copy should exist');
        assert.equal(fs.statSync(`${FIXTURES_DIR}/build.ninja`).mtime.getTime(),
          mtime,
          'build.ninja should not be modified');
        done();
      });
  });

});
