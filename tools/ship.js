#!/usr/bin/env node
// Ship main to production (GitHub Pages) and leave a trail in SHIP-LOG.txt.
// Owner approval is required before running this (Iron Rule 1). Usage: node tools/ship.js [--dry-run]
//
// Goal-state check, not step check: success means the LIVE site serves the sw.js VERSION we pushed,
// not merely that `git push` exited 0. Pages can take a few minutes; if it does not update in time we
// log PENDING and exit 1, so nobody marks the work live by mistake.
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const root = path.join(__dirname, '..');
const LIVE_SW = 'https://tchawankon.github.io/piefit/sw.js';
const LOG = path.join(root, 'SHIP-LOG.txt');
const WAIT_MS = 10 * 60 * 1000, EVERY_MS = 15 * 1000;
const dry = process.argv.includes('--dry-run');

const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8' }).trim();
const die = msg => { console.error('ship: STOP - ' + msg); process.exit(1); };
const versionOf = text => (text.match(/const VERSION\s*=\s*'([^']+)'/) || [])[1];
const sleep = ms => new Promise(r => setTimeout(r, ms));

function logLine(sha, ver, result) {
  const line = `${new Date().toISOString()}  main@${sha}  sw=${ver}  ${result}\n`;
  fs.appendFileSync(LOG, line);
  console.log('ship: logged -> ' + line.trim());
}

(async () => {
  // 1. all checks green
  const pf = spawnSync(process.execPath, ['tools/preflight.js'], { cwd: root, stdio: 'inherit' });
  if (pf.status !== 0) die('preflight failed');

  // 2. on main, clean tree, fast-forward of origin/main
  if (git('rev-parse', '--abbrev-ref', 'HEAD') !== 'main') die('not on main (merge the feature branch into main first, with the owner\'s OK)');
  if (git('status', '--porcelain')) die('working tree not clean; commit or stash first');
  git('fetch', 'origin', 'main');
  if (spawnSync('git', ['merge-base', '--is-ancestor', 'origin/main', 'main'], { cwd: root }).status !== 0) die('main is not a fast-forward of origin/main; pull/rebase first');
  const sha = git('rev-parse', '--short=7', 'main');
  if (sha === git('rev-parse', '--short=7', 'origin/main')) die('nothing to ship: main == origin/main');

  const ver = versionOf(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'));
  if (!ver) die('could not read VERSION from sw.js');
  console.log(`ship: main@${sha} sw=${ver} -> ${LIVE_SW}`);
  if (dry) { console.log('ship: --dry-run, stopping before push'); return; }

  // 3. push = deploy
  execFileSync('git', ['push', 'origin', 'main'], { cwd: root, stdio: 'inherit' });

  // 4. wait until production serves the new version
  const t0 = Date.now(); let live = null;
  while (Date.now() - t0 < WAIT_MS) {
    try {
      const res = await fetch(LIVE_SW + '?ship=' + Date.now(), { cache: 'no-store' });
      if (res.ok) live = versionOf(await res.text());
    } catch (e) { /* offline or Pages hiccup: keep trying */ }
    if (live === ver) break;
    process.stdout.write(`ship: live sw=${live || '?'}, waiting...\r`);
    await sleep(EVERY_MS);
  }
  const ok = live === ver;
  logLine(sha, ver, ok ? 'OK' : `PENDING (live sw=${live || '?'} after ${WAIT_MS / 60000} min)`);

  // 5. commit only the log line, so later sessions see the ship (SHIP-LOG.txt is not in sw.js FILES)
  git('add', 'SHIP-LOG.txt');
  git('commit', '-m', `Ship log: main@${sha} ${ver} ${ok ? 'OK' : 'PENDING'}`);
  execFileSync('git', ['push', 'origin', 'main'], { cwd: root, stdio: 'inherit' });

  if (!ok) die('production did not show the new VERSION in time; check Pages, then re-run or verify by hand');
  console.log('ship: OK, production serves ' + ver);
})().catch(e => die(e.message));
