#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, openSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../../..');
const references = join(here, '../references');
const usage = `Usage:
  radar.mjs lanes <run dir> [lane...]
  radar.mjs lanes <run dir> <lane> --gap <file>
  radar.mjs npm <radar.json>
  radar.mjs paint <radar.json> <art dir> [--map] [idea id...]
  radar.mjs render <radar.json> <page.html>
  radar.mjs shoot <page.html> <art dir> <out dir>`;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const today = () => new Date().toISOString().slice(0, 10);

const lanes = () => {
  const text = readFileSync(join(references, 'lanes.md'), 'utf8');
  const [brief, ...sections] = text.split(/^## Lane: /m);
  return {
    brief: brief.trim(),
    lanes: Object.fromEntries(sections.map((section) => {
      const [id, ...body] = section.split('\n');
      return [id.trim(), body.join('\n').trim()];
    })),
  };
};

const howExplorerArgs = () => {
  const sheet = join(homedir(), '.claude/pstack-models.md');
  const line = existsSync(sheet) ? readFileSync(sheet, 'utf8').match(/^how explorer:\s*codex:(\S+)(?:\s*@(\w+))?/m) : null;
  return line ? ['--model', line[1], ...(line[2] ? ['--effort', line[2]] : [])] : [];
};

const run = (command, args, options) => new Promise((done) => {
  const child = spawn(command, args, { ...options, stdio: ['ignore', options.out ?? 'inherit', options.err ?? 'inherit'] });
  child.on('close', (code) => done(code));
});

const attemptStem = (runDir, id) => {
  let n = 1;
  while (existsSync(join(runDir, `lane-${id}${n === 1 ? '' : `-a${n}`}.md`))) n++;
  return join(runDir, `lane-${id}${n === 1 ? '' : `-a${n}`}`);
};

const runLanes = async (runDir, args) => {
  const gapAt = args.indexOf('--gap');
  const picked = gapAt === -1 ? args : args.filter((_, index) => index !== gapAt && index !== gapAt + 1);
  const gap = gapAt === -1 ? '' : readFileSync(args[gapAt + 1], 'utf8').trim();
  if (gapAt !== -1 && picked.length !== 1) fail('--gap reruns one lane, so name exactly one');
  const { brief, lanes: all } = lanes();
  const ids = picked.length ? picked : Object.keys(all);
  for (const id of ids) if (!all[id]) fail(`Unknown lane ${id}. Lanes: ${Object.keys(all).join(', ')}`);
  mkdirSync(runDir, { recursive: true });
  const rerun = gap ? `\n## Rerun\n\nAn earlier report on this lane left out what follows. Cover only this, in the same output format.\n\n${gap}\n` : '';
  const codes = await Promise.all(ids.map(async (id) => {
    const stem = attemptStem(runDir, id);
    writeFileSync(`${stem}.prompt.md`, `${brief}\n\n## Your lane\n\n${all[id]}\n${rerun}`);
    const code = await run('node', ['.agents/pstack/cross.mjs', '--to', 'codex', ...howExplorerArgs(), '--reach', '--timeout', '3300', '--prompt-file', `${stem}.prompt.md`], {
      cwd: root,
      out: openSync(`${stem}.md`, 'w'),
      err: openSync(`${stem}.err`, 'w'),
    });
    console.log(`lane ${id} exit ${code} -> ${stem}.md`);
    return code;
  }));
  if (codes.some(Boolean)) process.exit(1);
};

const refreshNpm = async (dataPath) => {
  const data = readJson(dataPath);
  for (const feature of Object.values(data.features)) {
    if (!feature.pkg) continue;
    const response = await fetch(`https://api.npmjs.org/downloads/point/last-month/${feature.pkg}`);
    if (!response.ok) fail(`npm refused ${feature.pkg}: ${response.status}`);
    feature.npm = (await response.json()).downloads;
  }
  data.npmRead = today();
  writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`npm counts read ${data.npmRead}`);
};

const NO_TEXT = 'ABSOLUTELY NO TEXT, letters, numbers, labels, banners or readable writing anywhere in the image. Lines of writing appear only as wavy scribbles.';

const paintOne = async (dir, name, prompt, reference) => {
  mkdirSync(dir, { recursive: true });
  const full = `Use your image generation tool to make ONE image, then save it as ${name}.png in the current working directory (copy it there if the tool saves elsewhere) and print its absolute path in your final message.\n\n${prompt}\n\n${NO_TEXT}`;
  const args = ['exec', '--skip-git-repo-check', '--sandbox', 'workspace-write', '-C', dir, '-c', 'model_reasoning_effort=low', ...(reference ? ['-i', reference] : []), '--', full];
  const log = openSync(join(dir, `${name}.log`), 'w');
  const code = await run('codex', args, { cwd: dir, out: log, err: log });
  const png = join(dir, `${name}.png`);
  if (code !== 0 || !existsSync(png)) return `${name}: no image (exit ${code}), see ${join(dir, `${name}.log`)}`;
  return png;
};

const toJpeg = (png, jpg, size) => {
  const result = spawnSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', ...(size ? ['-Z', String(size)] : []), png, '--out', jpg], { encoding: 'utf8' });
  if (result.status !== 0) fail(`sips could not convert ${png}: ${result.stderr || result.error}`);
};

const paint = async (dataPath, artDir, args) => {
  const data = readJson(dataPath);
  const work = mkdtempSync(join(tmpdir(), 'radar-paint-'));
  mkdirSync(artDir, { recursive: true });
  const mapJpg = join(artDir, 'map.jpg');
  if (args.includes('--map')) {
    const png = await paintOne(join(work, 'map'), 'map', `${data.map.prompt}\n\nLandscape 3:2.`);
    if (!png.endsWith('.png')) fail(png);
    toJpeg(png, mapJpg);
    console.log(`map -> ${mapJpg}`);
  }
  if (!existsSync(mapJpg)) fail(`${mapJpg} is missing; scenes take the map as their style reference, so paint it with --map or copy it from the published page first.`);
  const ids = args.filter((arg) => !arg.startsWith('--'));
  const ideas = data.ideas.filter((idea) => idea.scene && (ids.length ? ids.includes(idea.id) : !existsSync(join(artDir, `${idea.id}.jpg`))));
  const style = 'Match the attached map\'s illustration style exactly: same painterly hand-drawn look, soft paper texture, muted teal, warm sand and green palette, gentle light. A small vignette scene on a plain paper background with soft edges, so it sits on a card. Square 1:1.';
  const results = await Promise.all(ideas.map((idea) => paintOne(join(work, idea.id), idea.id, `${style}\n\nScene: ${idea.scene}`, mapJpg)));
  let failed = 0;
  results.forEach((png, index) => {
    if (!png.endsWith('.png')) { failed++; console.error(png); return; }
    const jpg = join(artDir, `${ideas[index].id}.jpg`);
    toJpeg(png, jpg, 900);
    console.log(`${ideas[index].id} -> ${jpg}`);
  });
  rmSync(work, { recursive: true, force: true });
  if (failed) process.exit(1);
};

const renderPage = (data) => {
  const problems = [];
  const ids = new Set();
  for (const idea of data.ideas) {
    if (ids.has(idea.id)) problems.push(`${idea.id}: duplicate id`);
    ids.add(idea.id);
    if (!data.sectors[idea.sector]) problems.push(`${idea.id}: sector ${idea.sector} has no island on the map`);
    const [x, y] = idea.at ?? [];
    if (!(x >= 0 && x <= 100 && y >= 0 && y <= 100)) problems.push(`${idea.id}: at needs [x, y] percentages on its island`);
    if (idea.rank && !idea.scene) problems.push(`${idea.id}: a ranked idea needs a scene prompt`);
    for (const feature of idea.grows ?? []) if (!data.features[feature]) problems.push(`${idea.id}: grows from unknown feature ${feature}`);
  }
  if (problems.length) fail(problems.join('\n'));
  const template = readFileSync(join(references, 'map.html'), 'utf8');
  if (!template.includes('/*RADAR_DATA*/null')) fail('map.html lost its /*RADAR_DATA*/null marker');
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return template.replace('/*RADAR_DATA*/null', () => json);
};

const shoot = async (pagePath, artDir, outDir) => {
  const { chromium } = await import('@playwright/test');
  const site = mkdtempSync(join(tmpdir(), 'radar-shoot-'));
  symlinkSync(resolve(artDir), join(site, 'art'));
  writeFileSync(join(site, 'index.html'), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">${readFileSync(pagePath, 'utf8')}</html>`);
  mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  let bad = 0;
  for (const [name, viewport, colorScheme] of [['light', { width: 1360, height: 900 }, 'light'], ['dark', { width: 1360, height: 900 }, 'dark'], ['phone', { width: 390, height: 844 }, 'light']]) {
    const context = await browser.newContext({ viewport, colorScheme, isMobile: name === 'phone' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));
    page.on('requestfailed', (request) => errors.push(`failed ${request.url()}`));
    await page.goto(`file://${join(site, 'index.html')}`);
    await page.waitForTimeout(1000);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (errors.length || overflow > 0) bad++;
    const shot = join(outDir, `${basename(pagePath, '.html')}-${name}.png`);
    await page.screenshot({ path: shot });
    console.log(`${name}: ${errors.length ? errors.join(' | ') : 'no errors'}, page overflow ${overflow}px -> ${shot}`);
    await context.close();
  }
  await browser.close();
  rmSync(site, { recursive: true, force: true });
  if (bad) process.exit(1);
};

const main = async ([command, ...args]) => {
  if (command === 'lanes' && args[0]) return runLanes(resolve(args[0]), args.slice(1));
  if (command === 'npm' && args[0]) return refreshNpm(args[0]);
  if (command === 'paint' && args[1]) return paint(args[0], args[1], args.slice(2));
  if (command === 'render' && args[1]) {
    writeFileSync(args[1], renderPage(readJson(args[0])));
    return console.log(`page -> ${args[1]}`);
  }
  if (command === 'shoot' && args[2]) return shoot(args[0], args[1], args[2]);
  fail(usage);
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv.slice(2));
