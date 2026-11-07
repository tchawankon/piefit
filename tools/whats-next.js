#!/usr/bin/env node
// Session-start reconcile. Report only; always exits 0. No network.
'use strict';
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.join(__dirname, '..');

function run(cmd, args) {
  const r = cp.spawnSync(cmd, args, { cwd: root, encoding: 'utf8', timeout: 5000, windowsHide: true });
  if (r.error) throw r.error;
  return { code: r.status, out: (r.stdout || '').replace(/\s+$/, ''), err: (r.stderr || '').trim() };
}
function git(...args) {
  const r = run('git', args);
  if (r.code !== 0) throw new Error(r.err || `git ${args.join(' ')} failed`);
  return r.out;
}
function section(name, fn) {
  console.log(`== ${name} ==`);
  try { fn(); } catch (e) { console.log(`  (error: ${e.message})`); }
}
const swVer = s => { const m = /VERSION\s*=\s*['"]([^'"]+)['"]/.exec(s || ''); return m ? m[1] : '?'; };

let originSha = null;

section('git', () => {
  console.log('branch: ' + git('rev-parse', '--abbrev-ref', 'HEAD'));
  const st = git('status', '--short').split('\n').filter(Boolean);
  if (!st.length) console.log('status: clean');
  else {
    console.log(`status: ${st.length} changed`);
    st.slice(0, 15).forEach(l => console.log('  ' + l));
    if (st.length > 15) console.log(`  ... +${st.length - 15} more`);
  }
  console.log('branches vs origin/main (remote refs as of last fetch):');
  git('for-each-ref', '--format=%(refname:short)', 'refs/heads').split('\n').filter(Boolean).forEach(b => {
    try {
      const [behind, ahead] = git('rev-list', '--left-right', '--count', `origin/main...${b}`).split(/\s+/);
      console.log(`  ${b}: ahead ${ahead}, behind ${behind}`);
    } catch (e) { console.log(`  ${b}: (no origin/main)`); }
  });
  console.log('last 5 commits:');
  git('log', '--oneline', '-5').split('\n').forEach(l => console.log('  ' + l));
  const wt = git('worktree', 'list').split('\n').filter(Boolean);
  if (wt.length > 1) { console.log('worktrees:'); wt.forEach(l => console.log('  ' + l)); }
});

section('live', () => {
  console.log('main = production (GitHub Pages). Live = origin/main. (remote refs as of last fetch)');
  originSha = git('rev-parse', 'origin/main');
  console.log(`origin/main: ${originSha.slice(0, 7)} ${git('log', '-1', '--format=%s', 'origin/main')}`);
  let remoteV, localV;
  try { remoteV = swVer(git('show', 'origin/main:sw.js')); } catch (e) { remoteV = '(unreadable)'; }
  try { localV = swVer(fs.readFileSync(path.join(root, 'sw.js'), 'utf8')); } catch (e) { localV = '(unreadable)'; }
  console.log(`sw.js VERSION: origin/main ${remoteV}, working tree ${localV}${remoteV === localV ? '' : '  (differs)'}`);
});

section('ship log', () => {
  const f = path.join(root, 'SHIP-LOG.txt');
  if (!fs.existsSync(f)) { console.log('no ships recorded'); return; }
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) { console.log('no ships recorded'); return; }
  lines.slice(-3).forEach(l => console.log('  ' + l));
  const lastOk = lines.slice().reverse().find(l => /\bOK\b/.test(l));
  // ship.js commits the log line after the shipped commit, so origin/main may be ahead of the shipped sha
  // by commits that touch only SHIP-LOG.txt. Anything else on origin/main was pushed outside ship.js.
  const shipped = lastOk && (lastOk.match(/main@([0-9a-f]{7,})/) || [])[1];
  let outside = !!originSha;
  if (shipped && originSha) {
    try {
      const changed = cp.execFileSync('git', ['diff', '--name-only', shipped, 'origin/main'], { cwd: root, encoding: 'utf8' })
        .split(/\r?\n/).filter(Boolean);
      outside = changed.some(f => f !== 'SHIP-LOG.txt');
    } catch (e) { outside = true; }
  }
  if (outside) {
    console.log(`  FLAG: origin/main ${originSha.slice(0, 7)} has changes after the last OK ship (pushed outside ship.js or log not written)`);
  }
});

section('checks', () => {
  for (const [file, args] of [['sprint-check.js', []], ['map-check.js', ['--quiet']]]) {
    const p = path.join(__dirname, file);
    if (!fs.existsSync(p)) { console.log(`  ${file}: not present, skipped`); continue; }
    try {
      const r = run(process.execPath, [p, ...args]);
      const lines = r.out.split('\n');
      const keep = [];
      lines.forEach((l, i) => {
        if (/^FAIL\b/.test(l)) {
          keep.push(l);
          for (let j = i + 1; j < lines.length && /^\s+\S/.test(lines[j]) && !/^\s+warn:/.test(lines[j]); j++) keep.push(lines[j]);
        }
      });
      const summary = lines.slice().reverse().find(l => /^[\w-]+-check:/.test(l));
      keep.forEach(l => console.log('  ' + l));
      console.log('  ' + (summary || `${file}: exit ${r.code}${r.err ? ' - ' + r.err.split('\n')[0] : ''}`));
    } catch (e) { console.log(`  ${file}: error ${e.message}`); }
  }
});

section('sprint', () => {
  const f = path.join(root, 'CURRENT-SPRINT.md');
  if (!fs.existsSync(f)) { console.log('  CURRENT-SPRINT.md not found'); return; }
  const { parseSprint } = require('./sprint-check.js');
  const entries = parseSprint(fs.readFileSync(f, 'utf8'));
  const order = ['in-progress', 'code-complete', 'staging', 'planned', 'parked', 'live'];
  let any = false;
  for (const s of order) {
    const g = entries.filter(e => e.status === s);
    if (!g.length) continue;
    any = true;
    console.log(`${s} (${g.length}):`);
    g.forEach(e => console.log(`- ${e.heading} — OPEN: ${e.open}`));
  }
  const odd = entries.filter(e => !order.includes(e.status));
  if (odd.length) { console.log('unparsed status:'); odd.forEach(e => console.log(`- ${e.heading} — OPEN: ${e.open}`)); any = true; }
  if (!any) console.log('  (no entries)');
  console.log("Priority is the owner's call; ask before starting anything new.");
});

process.exit(0);
