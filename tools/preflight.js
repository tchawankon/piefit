#!/usr/bin/env node
// Preflight: every dev-time check in one command. Run before any commit you report as done and before ship.
// Exits 1 if anything fails. Read-only.
'use strict';
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const root = path.join(__dirname, '..');

const jsFiles = [
  ...fs.readdirSync(root).filter(f => f.endsWith('.js')),
  ...fs.readdirSync(path.join(root, 'tools')).filter(f => f.endsWith('.js')).map(f => 'tools/' + f),
  ...fs.readdirSync(path.join(root, 'native')).filter(f => f.endsWith('.js')).map(f => 'native/' + f),
];

let failed = 0;
const syntaxBad = jsFiles.filter(f => spawnSync(process.execPath, ['--check', f], { cwd: root, encoding: 'utf8' }).status !== 0);
if (syntaxBad.length) { failed++; console.log('FAIL node --check: ' + syntaxBad.join(', ')); }
else console.log(`PASS node --check (${jsFiles.length} files)`);

for (const [label, args] of [['map-check', ['tools/map-check.js', '--quiet']], ['sprint-check', ['tools/sprint-check.js']]]) {
  const r = spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' });
  const out = (r.stdout + r.stderr).trim();
  if (r.status !== 0) { failed++; console.log(`FAIL ${label}\n` + out.split('\n').filter(l => /FAIL|^\s+\S/.test(l) || /check:/.test(l)).join('\n')); }
  else console.log(`PASS ${label}` + (out ? ' :: ' + out.split('\n').pop() : ''));
}

console.log(failed ? `preflight: ${failed} failing` : 'preflight: all green');
process.exit(failed ? 1 : 0);
