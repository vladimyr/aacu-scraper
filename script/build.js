'use strict';

const { exec } = require('pkg');
const { name, pkg } = require('../package.json');
const { renameSync } = require('fs');
const del = require('del');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outDir = path.join(rootDir, 'build');

(async function () {
  console.error('Cleaning output directory: %s', outDir);
  del.sync(outDir);
  console.error('Build binaries using pkg: %j', pkg);
  await exec([rootDir, '--out-dir', outDir]);
  renameSync(path.join(outDir, `${name}-macos`), path.join(outDir, name));
  renameSync(path.join(outDir, `${name}-win.exe`), path.join(outDir, `${name}.exe`));
  console.error('Done');
}()).catch(err => { throw err; });
