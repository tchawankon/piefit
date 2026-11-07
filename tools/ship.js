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
const LIVE_BASE = 'https://tchawankon.github.io/piefit/';
const LIVE_SW = LIVE_BASE + 'sw.js';
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

  // A file whose content changed in this ship, to compare against production byte for byte.
  // sw.js is the best probe; Jekyll turns .md into .html and hides dot/underscore files, so skip those.
  const prev = git('rev-parse', 'origin/main'), full = git('rev-parse', 'main');
  const changed = git('diff', '--name-only', prev, full).split(/\r?\n/).filter(Boolean);
  const servable = changed.filter(f => !/\.md$/i.test(f) && !/(^|\/)[._]/.test(f) && f !== 'SHIP-LOG.txt');
  const probe = servable.includes('sw.js') ? 'sw.js' : servable[0] || null;
  const norm = s => s.replace(/\r\n/g, '\n').trimEnd(); // git() trims its output, so compare without trailing whitespace
  const want = probe ? norm(git('show', `${full}:${probe}`)) : null;

  // 3. push = deploy
  execFileSync('git', ['push', 'origin', 'main'], { cwd: root, stdio: 'inherit' });

  // 4. goal state: the Pages deploy of THIS commit succeeded AND production serves the new content.
  // (Checking only VERSION is not enough: a docs-only ship keeps the same VERSION and would pass instantly.)
  const deployOf = () => {
    try {
      // the Pages workflow is GitHub-managed: `--workflow <name>` cannot find it, so filter by run name
      const out = execFileSync('gh', ['run', 'list', '--commit', full, '--json', 'name,status,conclusion', '--jq',
        '[.[] | select(.name=="pages build and deployment")][0] | .status + " " + .conclusion'], { cwd: root, encoding: 'utf8' }).trim();
      return out && out !== ' ' ? out : 'not-started';
    } catch (e) { return e.code === 'ENOENT' ? 'gh-unavailable' : 'gh-error'; }
  };
  const t0 = Date.now(); let deploy = '', live = null, contentOk = !probe;
  while (Date.now() - t0 < WAIT_MS) {
    deploy = deployOf();
    if (/^completed (failure|cancelled|timed_out)/.test(deploy)) break;
    try {
      const res = await fetch(`${LIVE_BASE}${probe || 'sw.js'}?ship=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) { const body = norm(await res.text()); live = versionOf(body) || live; if (probe) contentOk = body === want; }
    } catch (e) { /* offline or Pages hiccup: keep trying */ }
    const deployOk = deploy === 'completed success' || deploy === 'gh-unavailable';
    if (deployOk && contentOk) break;
    process.stdout.write(`ship: deploy=${deploy}, ${probe || 'sw.js'} live=${contentOk ? 'new' : 'old'}, waiting...\r`);
    await sleep(EVERY_MS);
  }
  const ok = (deploy === 'completed success' || deploy === 'gh-unavailable') && contentOk;
  logLine(sha, ver, ok ? 'OK' + (deploy === 'gh-unavailable' ? ' (deploy not checked: gh missing)' : '')
    : `PENDING (deploy=${deploy}, ${probe} ${contentOk ? 'new' : 'old'} after ${Math.round((Date.now() - t0) / 60000)} min)`);

  // 5. commit only the log line, so later sessions see the ship (SHIP-LOG.txt is not in sw.js FILES)
  git('add', 'SHIP-LOG.txt');
  git('commit', '-m', `Ship log: main@${sha} ${ver} ${ok ? 'OK' : 'PENDING'}`);
  execFileSync('git', ['push', 'origin', 'main'], { cwd: root, stdio: 'inherit' });

  if (!ok) die('the Pages deploy did not succeed or production still serves old content; check Pages, then re-run or verify by hand');
  console.log('ship: OK, production serves main@' + sha + ' (sw=' + ver + ')');
})().catch(e => die(e.message));
