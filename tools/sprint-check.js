#!/usr/bin/env node
// Validates CURRENT-SPRINT.md. Usage: node tools/sprint-check.js [path]
// Exit 1 if any entry fails. Zero dependencies.
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const STATUSES = ['planned', 'in-progress', 'code-complete', 'staging', 'live', 'parked'];
const STATUS_FORMAT = "STATUS: <planned|in-progress|code-complete|staging|live|parked> · <YYYY-MM-DD> · <evidence>  (separator is ' · ' U+00B7 only; ' | ' and ' - ' are not accepted)";

function validDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

// Returns {entries, global}.
function parseAll(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const global = [];
  const entries = [];
  const start = lines.findIndex(l => l.trim() === '## Entries');
  if (start < 0) { global.push("no '## Entries' line found"); return { entries, global }; }
  let cur = null;
  let ended = false;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i].replace(/\s+$/, '');
    if (/^## /.test(l)) { ended = true; cur = null; continue; }
    if (ended) { if (/^STATUS:/.test(l)) global.push(`line ${i + 1}: STATUS line outside an entry`); continue; }
    if (/^### /.test(l)) {
      cur = { heading: l.slice(4).trim(), status: null, date: null, evidence: null, open: null,
        verify: [], details: null, line: i + 1, statusLines: 0, problems: [], body: 0 };
      entries.push(cur);
      continue;
    }
    if (!cur) {
      if (/^STATUS:/.test(l)) global.push(`line ${i + 1}: STATUS line outside an entry`);
      continue;
    }
    if (l.trim() !== '') cur.body++;
    let m;
    if (/^STATUS:/.test(l)) {
      cur.statusLines++;
      if (cur.statusLines > 1) continue;
      const mm = /^STATUS:\s*(\S+)\s+·\s+(\S+)\s+·(?:\s+(.*))?$/.exec(l);
      if (!mm) { cur.problems.push('STATUS line must be: ' + STATUS_FORMAT); continue; }
      cur.status = mm[1]; cur.date = mm[2]; cur.evidence = (mm[3] || '').trim();
    } else if ((m = /^OPEN:\s*(.*)$/.exec(l))) {
      if (cur.open === null) cur.open = m[1].trim();
    } else if ((m = /^VERIFY:\s*(.*)$/.exec(l))) {
      m[1].split(/\s;\s/).map(s => s.trim()).filter(Boolean).forEach(p => cur.verify.push(p));
    } else if ((m = /^DETAILS:\s*(.*)$/.exec(l))) {
      cur.details = m[1].trim();
    }
  }
  return { entries, global };
}

function parseSprint(text) {
  return parseAll(text).entries.map(e => ({
    heading: e.heading, status: e.status, date: e.date, evidence: e.evidence,
    open: e.open, verify: e.verify, details: e.details, line: e.line
  }));
}

// Returns null if ok, else a problem string.
function runProbe(p) {
  let m;
  if ((m = /^(exists|missing)\s+(\S.*)$/.exec(p))) {
    const there = fs.existsSync(path.resolve(root, m[2].trim()));
    if (m[1] === 'exists' && !there) return `probe failed: ${p}  (file not found)`;
    if (m[1] === 'missing' && there) return `probe failed: ${p}  (path exists)`;
    return null;
  }
  if ((m = /^(contains|lacks)\s+(.+?)\s+::\s+(\S.*)$/.exec(p))) {
    const lit = m[3].trim();
    let txt;
    try { txt = fs.readFileSync(path.resolve(root, m[2].trim()), 'utf8'); }
    catch (e) { return `probe failed: ${p}  (cannot read ${m[2].trim()})`; }
    const has = txt.includes(lit);
    if (m[1] === 'contains' && !has) return `probe failed: ${p}  (literal not found)`;
    if (m[1] === 'lacks' && has) return `probe failed: ${p}  (literal is present)`;
    return null;
  }
  return `malformed probe: "${p}"  (use: exists <path> | missing <path> | contains <path> :: <text> | lacks <path> :: <text>)`;
}

function check(text) {
  const { entries, global } = parseAll(text);
  const seen = new Map();
  const results = [];
  for (const e of entries) {
    const probs = e.problems.slice();
    const warns = [];
    if (!e.heading) probs.push('empty heading');
    const key = e.heading.toLowerCase();
    if (seen.has(key)) probs.push(`duplicate heading (first at line ${seen.get(key)})`);
    else seen.set(key, e.line);
    if (e.statusLines === 0) probs.push('missing STATUS line');
    else if (e.statusLines > 1) probs.push(`${e.statusLines} STATUS lines (need exactly one)`);
    if (e.status !== null) {
      if (!STATUSES.includes(e.status)) probs.push(`invalid status "${e.status}" (use ${STATUSES.join('|')})`);
      if (!validDate(e.date)) probs.push(`bad date "${e.date}" (use a real YYYY-MM-DD)`);
      if (!e.evidence) probs.push('empty evidence (say what proves this status)');
    }
    if (e.open === null) probs.push('missing OPEN line (write "OPEN: nothing" if none)');
    else if (e.open === '') probs.push('empty OPEN (write "OPEN: nothing" if none)');
    if (e.status === 'live' && e.open !== null && e.open.toLowerCase() === 'nothing') {
      probs.push('live + OPEN nothing: archive it to ARCHIVE-LOG.md this session');
    }
    for (const p of e.verify) { const r = runProbe(p); if (r) probs.push(r); }
    if ((e.status === 'live' || e.status === 'parked') && e.body > 6) {
      warns.push(`${e.status} entry has ${e.body} lines; should be a stub (move detail to a DETAILS: pointer)`);
    }
    if ((e.status === 'planned' || e.status === 'in-progress') && e.verify.length === 0) {
      warns.push('no VERIFY line (add probes so "done" can be checked)');
    }
    results.push({ e, probs, warns });
  }
  return { results, global };
}

function main() {
  const file = process.argv[2] ? path.resolve(process.argv[2]) : path.join(root, 'CURRENT-SPRINT.md');
  let text;
  try { text = fs.readFileSync(file, 'utf8'); }
  catch (err) { console.log(`sprint-check: cannot read ${file}: ${err.message}`); process.exit(1); }
  const { results, global } = check(text);
  let failing = 0;
  for (const r of results) {
    const bad = r.probs.length > 0;
    if (bad) failing++;
    console.log(`${bad ? 'FAIL' : 'OK'} ${r.e.status || '?'} ${r.e.heading}`);
    r.probs.forEach(p => console.log('    ' + p));
    r.warns.forEach(w => console.log('    warn: ' + w));
  }
  for (const g of global) { failing++; console.log('FAIL ? (file)'); console.log('    ' + g); }
  console.log(`sprint-check: ${results.length} entries, ${failing} failing`);
  process.exit(failing ? 1 : 0);
}

module.exports = { parseSprint, check };
if (require.main === module) main();
