#!/usr/bin/env node
'use strict';
/* PieFit map check: statically verifies facts that span several files (the "map" in docs/).
   Usage: node tools/map-check.js [--quiet] [--write-baseline]
   Prints PASS/FAIL per check, exits 1 on any FAIL. Never runs app code, except i18n*.js inside a vm sandbox.
   Test overrides (not for normal use): MAP_DATA_PATH, CORE_CONTEXT_PATH. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const CORE_CONTEXT = process.env.CORE_CONTEXT_PATH || path.join(ROOT, 'docs', 'CORE-CONTEXT.md'); // load order + AI ids live here
const MAP_DATA = process.env.MAP_DATA_PATH || path.join(ROOT, 'docs', 'reference', 'MAP-DATA.md');   // storage key table
const BASELINE = path.join(__dirname, 'map-check.baseline.json');
const META_FIELDS = ['app', 'version', 'exported'];
// Storage keys built at runtime in a way this script cannot see. Add 'key': 'file' here with a comment if one appears.
const DYNAMIC_KEYS = {};

const args = process.argv.slice(2);
const QUIET = args.includes('--quiet');
const results = [];
const pass = (id, msg) => results.push({ s: 'PASS', id, msg });
const fail = (id, msg) => results.push({ s: 'FAIL', id, msg });
const note = (id, msg) => results.push({ s: 'NOTE', id, msg });

/* ---------- source helpers ---------- */
const read = f => fs.readFileSync(path.isAbsolute(f) ? f : path.join(ROOT, f), 'utf8').replace(/\r\n/g, '\n');
const exists = f => fs.existsSync(path.join(ROOT, f));
const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
const lineAt = (text, idx) => text.slice(0, idx).split('\n').length;

// Blank comments (and string contents unless keepStrings), keeping length and newlines so indices map to lines.
// Template literal text is blanked but ${...} code is kept.
function strip(src, keepStrings) {
  let out = '', i = 0, prev = '';
  const n = src.length, stack = [];
  const blank = s => s.replace(/[^\n]/g, ' ');
  while (i < n) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { const e = src.indexOf('\n', i); const end = e < 0 ? n : e; out += blank(src.slice(i, end)); i = end; continue; }
    if (c === '/' && d === '*') { const e = src.indexOf('*/', i + 2); const end = e < 0 ? n : e + 2; out += blank(src.slice(i, end)); i = end; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1; while (j < n && src[j] !== c && src[j] !== '\n') j += src[j] === '\\' ? 2 : 1;
      out += keepStrings ? src.slice(i, j + 1) : c + blank(src.slice(i + 1, j)) + (src[j] || ''); i = j + 1; prev = 'a'; continue;
    }
    if (c === '`' || (c === '}' && stack.length && stack[stack.length - 1] === 0)) {
      if (c === '}') stack.pop();
      let j = i + 1; while (j < n && src[j] !== '`' && !(src[j] === '$' && src[j + 1] === '{')) j += src[j] === '\\' ? 2 : 1;
      out += c + (keepStrings ? src.slice(i + 1, j) : blank(src.slice(i + 1, j)));
      if (src[j] === '`') { out += '`'; i = j + 1; } else { out += '${'; stack.push(0); i = j + 2; }
      prev = 'a'; continue;
    }
    if (c === '/' && /^$|[(,=:[!&|?{};+\-*%<>~^]/.test(prev)) { // regex literal
      let j = i + 1, cls = false;
      while (j < n && src[j] !== '\n' && (cls || src[j] !== '/')) { if (src[j] === '\\') j++; else if (src[j] === '[') cls = true; else if (src[j] === ']') cls = false; j++; }
      out += '/' + blank(src.slice(i + 1, j)) + '/'; i = j + 1; prev = 'a'; continue;
    }
    if (stack.length && c === '{') stack[stack.length - 1]++;
    if (stack.length && c === '}') stack[stack.length - 1]--;
    out += c; if (!/\s/.test(c)) prev = c; i++;
  }
  return out;
}

// Index of the bracket matching the one at idx (code must have strings blanked).
function matchBracket(code, idx) {
  const open = code[idx], close = { '{': '}', '(': ')', '[': ']' }[open];
  for (let i = idx, depth = 0; i < code.length; i++) {
    if (code[i] === open) depth++;
    else if (code[i] === close && --depth === 0) return i;
  }
  return -1;
}

// Split the inside of a bracket pair at depth-0 commas.
function splitTop(inner) {
  const parts = []; let depth = 0, start = 0;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if ('([{'.includes(c)) depth++; else if (')]}'.includes(c)) depth--;
    else if (c === ',' && depth === 0) { parts.push(inner.slice(start, i)); start = i + 1; }
  }
  if (inner.slice(start).trim()) parts.push(inner.slice(start));
  return parts.map(p => p.trim()).filter(Boolean);
}

// Member names of the object literal whose '{' is at idx: `a`, `a: x`, `a(){}`, `get a(){}`, `set a(v){}`.
function objectKeys(code, idx) {
  const end = matchBracket(code, idx);
  return splitTop(code.slice(idx + 1, end)).map(p => {
    const m = p.match(/^(?:(?:get|set|async)\s+)?([A-Za-z_$][\w$]*)\s*(:|\(|$)/);
    return m ? { name: m[1], value: m[2] === ':' ? p.slice(p.indexOf(':') + 1).trim() : '' } : null;
  }).filter(Boolean);
}

const JS = fs.readdirSync(ROOT).filter(f => f.endsWith('.js')).sort().map(name => {
  const raw = read(name);
  return { name, raw, lit: strip(raw, true), code: strip(raw, false) };
});
const jsFile = name => JS.find(f => f.name === name);

// Top-level IIFE modules: `const X = (() => {` ... `})();` -> {name, file, body: [start, end]}.
const MODULES = {};
for (const f of JS) {
  for (const m of f.code.matchAll(/^const ([A-Z][\w$]*) = \(\(\) => \{/gm)) {
    const open = m.index + m[0].length - 1;
    MODULES[m[1]] = { name: m[1], file: f, start: open, end: matchBracket(f.code, open) };
  }
}
function moduleReturns(mod) {
  const body = mod.file.code.slice(mod.start, mod.end);
  const idx = body.lastIndexOf('return {') >= 0 ? body.lastIndexOf('return {') : body.search(/return\s*\{(?![\s\S]*return\s*\{)/);
  return idx < 0 ? [] : objectKeys(mod.file.code, mod.start + idx + body.slice(idx).indexOf('{')).map(k => k.name);
}

function swFiles() {
  const sw = jsFile('sw.js').lit, m = sw.match(/const FILES\s*=\s*\[([^\]]*)\]/);
  return m ? [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1]) : [];
}
const diskName = f => (f === './' ? 'index.html' : f.replace(/^\.\//, ''));

/* ---------- checks ---------- */

// MAP-FILES-CACHE: every file the page loads is in the offline cache, and the cache lists only real files.
function checkScriptsSw() {
  const id = 'scripts-sw', html = read('index.html'), files = swFiles(), cached = new Set(files.map(diskName));
  const bad = [];
  const local = u => !/^(https?:|\/\/|data:|#|mailto:)/.test(u);
  for (const m of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
    const u = m[1].replace(/^\.\//, '').split(/[?#]/)[0];
    if (local(u) && !cached.has(u)) bad.push(`index.html:${lineAt(html, m.index)} loads "${u}" but sw.js FILES lacks './${u}'; add it and bump VERSION`);
  }
  if (exists('manifest.webmanifest')) {
    for (const ic of (JSON.parse(read('manifest.webmanifest')).icons || [])) {
      const u = ic.src.replace(/^\.\//, '');
      if (local(u) && !cached.has(u)) bad.push(`manifest.webmanifest icon "${u}" is not in sw.js FILES; add './${u}'`);
    }
  }
  for (const f of files) if (!exists(diskName(f))) bad.push(`sw.js FILES lists "${f}" but ${diskName(f)} does not exist; remove it or add the file`);
  bad.length ? bad.forEach(b => fail(id, b)) : pass(id, `${files.length} cached files, all page assets cached and present`);
}

// CORE-CONTEXT "loaded in this order" must match index.html, so the doc never lies about dependencies.
function checkLoadOrder() {
  const id = 'load-order', ctxName = rel(CORE_CONTEXT);
  if (!fs.existsSync(CORE_CONTEXT)) return fail(id, `${ctxName} not found; it must hold the "loaded in this order:" line`);
  const line = read(CORE_CONTEXT).split('\n').find(l => l.includes('loaded in this order:'));
  if (!line) return fail(id, `${ctxName} has no line containing "loaded in this order:"`);
  const doc = line.split('loaded in this order:')[1].trim().replace(/\.\s*$/, '').split(',').map(s => s.trim()).filter(Boolean);
  const html = [...read('index.html').matchAll(/<script\s+src="([^"]+)\.js"/g)].map(m => m[1].replace(/^\.\//, ''));
  if (doc.join(',') === html.join(',')) return pass(id, `${html.length} scripts in documented order`);
  const i = doc.findIndex((d, k) => d !== html[k]);
  fail(id, `${ctxName} order differs from index.html at position ${i + 1} (doc "${doc[i]}", html "${html[i]}"); html: ${html.join(', ')}. Update whichever is wrong`);
}

function git(...a) { return execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); }

// MAP-FILES-CACHE: a change to any cached file ships only if sw.js VERSION is bumped versus main.
function checkSwVersion() {
  const id = 'sw-version';
  try { git('rev-parse', '--verify', 'origin/main'); } catch (e) { return pass(id, 'origin/main not available; skipped'); }
  const ver = s => (s.match(/const VERSION\s*=\s*['"]([^'"]+)['"]/) || [])[1];
  const mainSw = (() => { try { return git('show', 'origin/main:sw.js').replace(/\r\n/g, '\n'); } catch (e) { return ''; } })();
  const changed = swFiles().map(diskName).filter(f => {
    if (!exists(f)) return false;
    try { return git('show', `origin/main:${f}`).replace(/\r\n/g, '\n') !== read(f); } catch (e) { return true; }
  });
  const now = ver(read('sw.js')), old = ver(mainSw);
  if (!changed.length) return pass(id, `no cached file differs from origin/main (VERSION ${now})`);
  if (now !== old) return pass(id, `${changed.length} cached file(s) changed, VERSION ${old} -> ${now}`);
  fail(id, `sw.js:${lineAt(read('sw.js'), read('sw.js').indexOf('const VERSION'))} VERSION is still ${now} but ${changed.join(', ')} changed vs origin/main; bump VERSION`);
}

// MAP-FILES-CACHE: install must bypass the HTTP cache or a new VERSION can cache stale files.
function checkSwReload() {
  /cache\s*:\s*['"]reload['"]/.test(jsFile('sw.js').lit) // lit = comments stripped, strings kept
    ? pass('sw-reload', "sw.js install uses cache:'reload'")
    : fail('sw-reload', "sw.js no longer has cache:'reload' in the install fetch; restore new Request(f, {cache:'reload'})");
}

// Every storage key used in code, with the files using it: Map key -> {files:Set, at:'file:line'}.
function codeKeys() {
  const keys = new Map(), unresolved = [];
  const add = (k, f, idx) => { if (!keys.has(k)) keys.set(k, { files: new Set(), at: `${f.name}:${lineAt(f.lit, idx)}` }); keys.get(k).files.add(f.name); };
  for (const f of JS) {
    const consts = Object.fromEntries([...f.lit.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*['"]([^'"]+)['"]/g)].map(m => [m[1], m[2]]));
    // `['a','b'].map(n => ... store.get(n ...)` : the array literal lists the keys
    const lists = [...f.lit.matchAll(/\[([^\[\]]*)\]\s*\.\s*(?:map|forEach)\(\s*\(?\s*([A-Za-z_$][\w$]*)\s*\)?\s*=>/g)]
      .map(m => ({ ident: m[2], from: m.index, to: m.index + m[0].length + 300, keys: [...m[1].matchAll(/['"]([^'"]+)['"]/g)].map(x => x[1]) }));
    for (const m of f.lit.matchAll(/\bstore\.(?:get|set)\(\s*([^,)]+?)\s*[,)]/g)) {
      const a = m[1], lit = a.match(/^['"]([^'"]+)['"]$/);
      if (lit) { add(lit[1], f, m.index); continue; }
      if (consts[a]) { add(consts[a], f, m.index); continue; }
      const list = lists.find(l => l.ident === a && m.index > l.from && m.index < l.to);
      if (list) { list.keys.forEach(k => add(k, f, m.index)); continue; }
      unresolved.push(`${f.name}:${lineAt(f.lit, m.index)} store key "${a}" cannot be resolved statically; use a literal or const, or add it to DYNAMIC_KEYS in tools/map-check.js`);
    }
  }
  for (const [k, file] of Object.entries(DYNAMIC_KEYS)) add(k, jsFile(file), 0);
  return { keys, unresolved };
}

// Rows of the "## Storage keys" table: {key, owner, backup (field or null), line}.
function mapRows() {
  if (!fs.existsSync(MAP_DATA)) return null;
  const lines = read(MAP_DATA).split('\n'), rows = [], bad = [];
  let inSec = false;
  lines.forEach((l, i) => {
    if (/^## /.test(l)) inSec = /^## Storage keys/.test(l);
    if (!inSec || !/^\|/.test(l)) return;
    const cells = l.split('|').slice(1, -1).map(c => c.trim());
    const key = (cells[0] || '').match(/^`([^`]+)`$/);
    if (!key) return; // header / separator
    const b = cells[2] || '', field = b.match(/^`([^`]+)`$/);
    if (!field && !/^none\b/.test(b)) bad.push(`${rel(MAP_DATA)}:${i + 1} backup cell "${b}" must be \`field\` or start with "none"`);
    rows.push({ key: key[1], owner: cells[1], backup: field ? field[1] : null, line: i + 1 });
  });
  return { rows, bad };
}

// MAP-DATA "Storage keys": the table lists exactly the keys the code uses, with a real owner file.
function checkStorageKeys() {
  const id = 'storage-keys', map = mapRows(), mapName = rel(MAP_DATA);
  if (!map) return fail(id, `${mapName} not found; create it with a "## Storage keys" table`);
  const { keys, unresolved } = codeKeys(), bad = [...unresolved, ...map.bad];
  const listed = new Map(map.rows.map(r => [r.key, r]));
  for (const [k, v] of keys) if (!listed.has(k)) bad.push(`key "${k}" (${v.at}) is missing from ${mapName}; add a row | \`${k}\` | ${[...v.files][0]} | ... |`);
  for (const r of map.rows) {
    if (!keys.has(r.key)) bad.push(`${mapName}:${r.line} lists "${r.key}" but no code uses it; remove the row or fix the name`);
    else if (!keys.get(r.key).files.has(r.owner)) bad.push(`${mapName}:${r.line} owner of "${r.key}" is ${r.owner} but it is used only in ${[...keys.get(r.key).files].join(', ')}`);
  }
  bad.length ? bad.forEach(b => fail(id, b)) : pass(id, `${keys.size} storage keys, table matches code`);
}

// Fields written by exportData and read by importData (top level, plus one level for module-nested exports).
// Returns {exp: Map field -> Set(subfields)|null, imp: same}.
function backupShape() {
  const app = jsFile('app.js'), c = app.code;
  const body = name => { const i = c.indexOf(`function ${name}(`); const o = c.indexOf('{', i); return [o, matchBracket(c, o)]; };
  const modExport = mod => { const f = MODULES[mod] && MODULES[mod].file; if (!f) return [];
    const m = f.code.match(/(?:function\s+exportState\s*\([^)]*\)\s*\{\s*return\s*|exportState\s*(?:=|:)\s*\([^)]*\)\s*=>\s*\(\s*)\{/);
    return m ? objectKeys(f.code, m.index + m[0].length - 1).map(k => k.name) : []; };
  const modImport = mod => { const f = MODULES[mod] && MODULES[mod].file; if (!f) return [];
    const m = f.code.match(/(?:function\s+importState\s*\(\s*(\w+)\s*\)\s*|importState\s*(?:=|:)\s*\(?\s*(\w+)\s*\)?\s*=>\s*)\{/);
    if (!m) return []; const o = m.index + m[0].length - 1, p = m[1] || m[2];
    return [...f.code.slice(o, matchBracket(f.code, o)).matchAll(new RegExp(`\\b${p}\\.([A-Za-z_$][\\w$]*)`, 'g'))].map(x => x[1]); };
  const exp = new Map(), imp = new Map();
  const put = (map, k, subs) => { // subs = nested field names (module-nested export), else plain field
    if (subs && !map.get(k)) map.set(k, new Set()); else if (!map.has(k)) map.set(k, null);
    if (subs) subs.forEach(s => map.get(k).add(s));
  };
  // export: the Object.assign(...) inside exportData
  const [eo, ee] = body('exportData'), es = c.slice(eo, ee), ai = es.indexOf('Object.assign(');
  const ao = eo + ai + 'Object.assign'.length;
  for (const arg of splitTop(c.slice(ao + 1, matchBracket(c, ao)))) {
    const mod = arg.match(/^([A-Z]\w*)\.exportState\(\)$/);
    if (mod) { modExport(mod[1]).forEach(k => put(exp, k)); continue; }
    const brace = arg.indexOf('{', arg.indexOf('?') + 1);
    if (brace < 0) continue;
    const offset = c.indexOf(arg, ao) + brace;
    for (const k of objectKeys(c, offset)) {
      const nested = k.value.match(/^([A-Z]\w*)\.exportState\(\)$/);
      put(exp, k.name, nested ? modExport(nested[1]) : null);
    }
  }
  // import: d.x in importData and applyImport (the confirmed second half), plus module importState(d) / importState(d.x)
  const IMPORT_FNS = ['importData', 'applyImport'];
  const is = IMPORT_FNS.filter(n => c.includes(`function ${n}(`)).map(n => { const [o, e] = body(n); return c.slice(o, e); }).join(' ');
  for (const m of is.matchAll(/\bd\.([A-Za-z_$][\w$]*)/g)) put(imp, m[1]);
  for (const m of is.matchAll(/\b([A-Z]\w*)\.importState\(\s*d(?:\.(\w+))?\s*\)/g)) {
    if (m[2]) put(imp, m[2], modImport(m[1])); else modImport(m[1]).forEach(k => put(imp, k));
  }
  META_FIELDS.forEach(k => { exp.delete(k); imp.delete(k); });
  return { exp, imp };
}

// MAP-DATA "Backup field": every backed-up key round-trips through export and import, and the two sides agree.
function checkBackupFields() {
  const id = 'backup-fields', map = mapRows(), { exp, imp } = backupShape(), bad = [];
  if (!map) fail(id, `${rel(MAP_DATA)} not found; cannot check backup fields per key`);
  else for (const r of map.rows.filter(r => r.backup)) {
    const [top, sub] = r.backup.split('.');
    const inExp = exp.has(top) && (!sub || (exp.get(top) && exp.get(top).has(sub)));
    const inImp = imp.has(top) && (!sub || (imp.get(top) && imp.get(top).has(sub)));
    if (!inExp) bad.push(`"${r.key}" backup field "${r.backup}" (MAP-DATA:${r.line}) is not exported; add it to exportData in app.js or ${r.owner} exportState`);
    if (!inImp) bad.push(`"${r.key}" backup field "${r.backup}" (MAP-DATA:${r.line}) is never read on import; read d.${r.backup} in importData or ${r.owner} importState`);
  }
  for (const k of exp.keys()) if (!imp.has(k)) bad.push(`field "${k}" is exported but importData never reads it; restoring a backup loses it`);
  for (const k of imp.keys()) if (!exp.has(k)) bad.push(`importData reads "d.${k}" but exportData never writes it; rename one side so they match`);
  for (const [k, subs] of exp) if (subs && imp.get(k)) {
    for (const s of subs) if (!imp.get(k).has(s)) bad.push(`nested field "${k}.${s}" is exported but its importState never reads it`);
    for (const s of imp.get(k)) if (!subs.has(s)) bad.push(`importState reads "${k}.${s}" but its exportState never writes it`);
  }
  bad.length ? bad.forEach(b => fail(id, b)) : pass(id, `${exp.size} backup fields round-trip (${[...exp.keys()].join(', ')})`);
}

// Iron rule "both languages": en/th have the same keys and every t('key') used in code exists.
function checkI18n() {
  const id = 'i18n', src = ['i18n.js', 'i18n-trainer.js'].map(read).join('\n').replace(/^const (STR|EXTH|LADTH)\b/gm, 'var $1');
  const ctx = {}; vm.runInNewContext(src, ctx, { timeout: 2000 });
  const en = Object.keys(ctx.STR.en), th = Object.keys(ctx.STR.th), all = new Set(en), bad = [];
  en.filter(k => !(k in ctx.STR.th)).forEach(k => bad.push(`STR.en.${k} has no Thai entry; add it to STR.th`));
  th.filter(k => !(k in ctx.STR.en)).forEach(k => bad.push(`STR.th.${k} has no English entry; add it to STR.en`));
  for (const f of JS) {
    for (const m of f.lit.matchAll(/(?<![\w$.])tv?\(\s*(?:(['"])([\w.-]+)\1\s*(\+)?|`([\w.-]*)\$\{)/g)) {
      const at = `${f.name}:${lineAt(f.lit, m.index)}`;
      if (m[4] !== undefined || m[3]) { const pre = m[4] !== undefined ? m[4] : m[2];
        if (![...all].some(k => k.startsWith(pre))) bad.push(`${at} t('${pre}' + ...) but no STR key starts with "${pre}"`); }
      else if (!all.has(m[2])) bad.push(`${at} t('${m[2]}') is not defined in STR; add en and th strings`);
    }
  }
  bad.length ? bad.forEach(b => fail(id, b)) : pass(id, `${en.length} keys in en and th, every t() key defined`);
}

// CORE-CONTEXT "AI": one Claude model id and one SDK version everywhere; Gemini key never in a URL.
function checkAiIds() {
  const id = 'ai-ids', bad = [], ctxName = rel(CORE_CONTEXT);
  const MODEL = /\bclaude-[a-z0-9][a-z0-9.-]*[a-z0-9]\b/g, SDK = /@anthropic-ai\/sdk@(\d+\.\d+\.\d+)/g;
  const doc = fs.existsSync(CORE_CONTEXT) ? read(CORE_CONTEXT) : '';
  const docModels = new Set(doc.match(MODEL) || []), docSdk = new Set([...doc.matchAll(SDK)].map(m => m[1]));
  if (docModels.size !== 1) bad.push(`${ctxName} should name exactly one Claude model id, found ${[...docModels].join(', ') || 'none'}`);
  if (docSdk.size !== 1) bad.push(`${ctxName} should name exactly one @anthropic-ai/sdk version, found ${[...docSdk].join(', ') || 'none'}`);
  const [wantModel] = docModels, [wantSdk] = docSdk;
  for (const f of JS) {
    for (const m of f.lit.matchAll(MODEL)) if (m[0] !== wantModel) bad.push(`${f.name}:${lineAt(f.lit, m.index)} uses model "${m[0]}", ${ctxName} says "${wantModel}"; keep them identical`);
    for (const m of f.lit.matchAll(SDK)) if (m[1] !== wantSdk) bad.push(`${f.name}:${lineAt(f.lit, m.index)} uses SDK ${m[1]}, ${ctxName} says ${wantSdk}`);
    f.lit.split('\n').forEach((l, i) => {
      if (/generativelanguage/.test(l) && /key=/.test(l) || /[?&]key=/.test(l)) bad.push(`${f.name}:${i + 1} puts an API key in a URL; send it in the x-goog-api-key header`);
    });
  }
  bad.length ? bad.forEach(b => fail(id, b)) : pass(id, `model ${wantModel}, SDK ${wantSdk}, no key in URLs`);
}

// Phone-first rule: the bottom nav fits a 360px screen only with 5 tabs or fewer.
function checkNav() {
  const app = jsFile('app.js'), i = app.code.indexOf('const TABS = [');
  if (i < 0) return fail('nav', 'app.js has no "const TABS = [" ; the check needs updating');
  const o = i + 'const TABS = '.length, n = splitTop(app.code.slice(o + 1, matchBracket(app.code, o))).length;
  n <= 5 ? pass('nav', `${n} bottom-nav tabs`) : fail('nav', `app.js:${lineAt(app.code, i)} TABS has ${n} entries; max 5 (move one under More)`);
}

// MAP-FILES-CACHE: the APK workflow is manual only.
function checkCiManual() {
  const id = 'ci-manual', f = '.github/workflows/android.yml';
  if (!exists(f)) return fail(id, `${f} not found`);
  const lines = read(f).split('\n'), i = lines.findIndex(l => /^['"]?on['"]?\s*:/.test(l));
  if (i < 0) return fail(id, `${f} has no top-level "on:" block`);
  const inline = lines[i].replace(/^['"]?on['"]?\s*:/, '').replace(/#.*/, '').trim();
  let triggers = inline ? inline.replace(/[[\]]/g, '').split(',').map(s => s.trim()).filter(Boolean) : [];
  if (!inline) for (const l of lines.slice(i + 1)) {
    if (/^\S/.test(l) && !/^#/.test(l)) break;
    const m = l.match(/^ {1,4}([\w-]+)\s*:?/); if (m && !/^\s*#/.test(l) && /^\s+/.test(l) && l.search(/\S/) === lines.slice(i + 1).find(x => x.trim() && !/^\s*#/.test(x)).search(/\S/)) triggers.push(m[1]);
  }
  triggers.join() === 'workflow_dispatch' ? pass(id, 'android.yml runs on workflow_dispatch only')
    : fail(id, `${f}:${i + 1} triggers are [${triggers.join(', ')}]; the APK build must be workflow_dispatch only`);
}

// MAP-MODULES: other files may only use members a module actually returns.
function checkModuleApi() {
  const id = 'module-api', bad = [];
  const api = Object.fromEntries(Object.values(MODULES).map(m => [m.name, new Set(moduleReturns(m))]));
  for (const f of JS) for (const name of Object.keys(api)) {
    if (MODULES[name].file === f) continue;
    for (const m of f.code.matchAll(new RegExp(`(?<![\\w$.])${name}\\.([A-Za-z_$][\\w$]*)`, 'g'))) {
      if (!api[name].has(m[1])) bad.push(`${f.name}:${lineAt(f.code, m.index)} uses ${name}.${m[1]} but ${MODULES[name].file.name} does not return it; add it to the module's return {...} or fix the name`);
    }
  }
  bad.length ? bad.forEach(b => fail(id, b)) : pass(id, `${Object.keys(api).length} modules (${Object.keys(api).join(', ')}), all cross-file members exist`);
}

// Iron rules 1 and 7: no new prompt/alert/confirm, no new document/window listeners. Counts may only go down.
function countRisky() {
  const out = {};
  for (const f of JS) {
    if (f.name === 'sw.js') continue;
    const c = f.code, n = re => (c.match(re) || []).length;
    const row = { prompt: n(/(?<![\w$.])prompt\s*\(/g), alert: n(/(?<![\w$.])alert\s*\(/g), confirm: n(/(?<![\w$.])confirm\s*\(/g),
      documentListener: n(/\bdocument\.addEventListener\s*\(/g), windowListener: n(/\bwindow\.addEventListener\s*\(/g) };
    if (Object.values(row).some(Boolean)) out[f.name] = row;
  }
  return out;
}
function checkBaseline() {
  const id = 'baseline', now = countRisky();
  if (args.includes('--write-baseline')) { fs.writeFileSync(BASELINE, JSON.stringify(now, null, 2) + '\n'); return pass(id, `wrote ${rel(BASELINE)}`); }
  if (!fs.existsSync(BASELINE)) return fail(id, `${rel(BASELINE)} missing; run with --write-baseline`);
  const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8')), bad = [];
  for (const file of new Set([...Object.keys(now), ...Object.keys(base)])) {
    for (const k of ['prompt', 'alert', 'confirm', 'documentListener', 'windowListener']) {
      const a = (now[file] || {})[k] || 0, b = (base[file] || {})[k] || 0;
      if (a > b) bad.push(`${file} has ${a} ${k} (baseline ${b}); use a .modal sheet / remove the listener instead`);
      else if (a < b) note(id, `${file} ${k} down to ${a} (baseline ${b}); lower baseline with --write-baseline`);
    }
  }
  bad.length ? bad.forEach(b => fail(id, b)) : pass(id, 'no file above its prompt/alert/confirm/listener baseline');
}

// MAP-FILES-CACHE: GitHub Pages runs Jekyll, which parses every .md as Liquid. A stray double-brace or
// brace-percent token fails the WHOLE site build, so production stops updating (incident 2026-11-07).
function checkJekyllLiquid() {
  const id = 'jekyll-liquid';
  if (fs.existsSync(path.join(ROOT, '.nojekyll'))) return pass(id, '.nojekyll present: Jekyll does not run');
  const skip = new Set(['node_modules', 'www', 'android', '.git', '.claude', '_to_delete']);
  const bad = [];
  (function walk(dir, rel) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(e.name)) continue;
      const r = rel ? rel + '/' + e.name : e.name, full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full, r);
      else if (/\.(md|markdown|html)$/i.test(e.name)) {
        fs.readFileSync(full, 'utf8').split(/\r?\n/).forEach((l, i) => { if (/\{\{|\{%/.test(l)) bad.push(`${r}:${i + 1}`); });
      }
    }
  })(ROOT, '');
  bad.length ? fail(id, `Liquid token in ${bad.join(', ')}; Jekyll would fail the Pages build. Rephrase (say "double braces") or wrap in {% raw %}`.replace('{% raw %}', 'a raw block'))
    : pass(id, 'no Liquid tokens in .md/.html');
}

/* ---------- run ---------- */
const CHECKS = { 'scripts-sw': checkScriptsSw, 'load-order': checkLoadOrder, 'sw-version': checkSwVersion, 'sw-reload': checkSwReload,
  'storage-keys': checkStorageKeys, 'backup-fields': checkBackupFields, i18n: checkI18n, 'ai-ids': checkAiIds, nav: checkNav,
  'ci-manual': checkCiManual, 'module-api': checkModuleApi, baseline: checkBaseline, 'jekyll-liquid': checkJekyllLiquid };
for (const [id, check] of Object.entries(CHECKS)) {
  try { check(); } catch (e) { fail(id, `check crashed: ${e.message} (script bug in tools/map-check.js)`); }
}
for (const r of results) if (!QUIET || r.s === 'FAIL') console.log(`${r.s} ${r.id} ${r.msg}`);
const fails = results.filter(r => r.s === 'FAIL').length;
console.log(`map-check: ${Object.keys(CHECKS).length} checks, ${fails} failure(s)`);
process.exit(fails ? 1 : 0);
