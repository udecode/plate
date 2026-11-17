import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./radar.mjs', import.meta.url));

const radar = (ideas) => ({
  ranked: '2026-01-01',
  npmRead: '2026-01-01',
  lede: 'Fixture radar.',
  method: ['Fixture method.'],
  map: { prompt: 'Fixture map.', home: { x: 50, y: 50 } },
  sectors: { review: { name: 'Collaboration and review', x: 70, y: 30 } },
  features: { comment: { label: 'comments' } },
  ideas,
});

const idea = (fields) => ({
  id: 'requests', rank: 1, name: 'Change requests', short: 'Change requests', sector: 'review', tier: 1, lean: 'both', cost: 'M', at: [66, 20],
  grows: ['comment'], job: 'Job.', apps: 'Apps', core: 'Core.', ai: 'AI.', slice: 'Slice.', why: 'Why.', leanText: 'Lean.', scene: 'A desk.',
  s: { reach: 2, pro: 3, ai: 3, reuse: 3, lanes: 2, hosted: 0 },
  ...fields,
});

const render = (data) => {
  const dir = mkdtempSync(join(tmpdir(), 'radar-render-'));
  try {
    writeFileSync(join(dir, 'radar.json'), JSON.stringify(data));
    const result = spawnSync('node', [script, 'render', join(dir, 'radar.json'), join(dir, 'page.html')], { encoding: 'utf8' });
    return { ...result, page: result.status === 0 ? readFileSync(join(dir, 'page.html'), 'utf8') : '' };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test('an idea added without a place on the map is refused instead of rendering an invisible pin', () => {
  const result = render(radar([idea({ sector: 'billing', at: undefined })]));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /requests: sector billing has no island/);
  assert.match(result.stderr, /requests: at needs \[x, y\]/);
});

test('a lane rerun for what its report left out keeps the first report', () => {
  const dir = mkdtempSync(join(tmpdir(), 'radar-lanes-'));
  try {
    const bin = join(dir, 'bin');
    mkdirSync(bin);
    writeFileSync(join(bin, 'node'), '#!/bin/sh\necho rerun report\n', { mode: 0o755 });
    writeFileSync(join(dir, 'lane-ai.md'), 'first report\n');
    writeFileSync(join(dir, 'gap.md'), 'Pricing pages for each AI idea.');
    const result = spawnSync(process.execPath, [script, 'lanes', dir, 'ai', '--gap', join(dir, 'gap.md')], {
      encoding: 'utf8',
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(join(dir, 'lane-ai.md'), 'utf8'), 'first report\n');
    assert.equal(readFileSync(join(dir, 'lane-ai-a2.md'), 'utf8'), 'rerun report\n');
    assert.match(readFileSync(join(dir, 'lane-ai-a2.prompt.md'), 'utf8'), /## Rerun[\s\S]*Pricing pages for each AI idea\./);
    assert.equal(existsSync(join(dir, 'lane-structure.md')), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('idea text that closes a script tag stays inside the page data', () => {
  const result = render(radar([idea({ why: 'Ends early </script><b>broken</b>' })]));
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.page.match(/<\/script>/g).length, 1);
  assert.match(result.page, /Ends early \\u003c\/script>/);
});
