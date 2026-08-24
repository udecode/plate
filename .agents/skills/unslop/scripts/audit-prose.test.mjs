import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { auditTarget, auditText, compareText, prepareText } from './audit-prose.mjs';

test('audit finds formula clusters and leaked artifacts', () => {
  const text = `Great question! In today's evolving landscape, this pivotal system serves as a testament to progress, highlighting its importance. citeturn0search1`;
  const result = auditText(text);
  const ids = new Set(result.findings.map((finding) => finding.id));
  assert.ok(ids.has('chatbot-artifact'));
  assert.ok(ids.has('significance-inflation'));
  assert.ok(ids.has('superficial-ing-tail'));
  assert.ok(ids.has('citation-token'));
  assert.ok(ids.has('watched-vocabulary-cluster'));
  assert.equal('score' in result, false);
});

test('audit masks frontmatter, code, links, and blockquotes', () => {
  const text = `---
description: A pivotal tapestry
---

\`delve()\`

\`\`\`js
const seamless = 'robust';
\`\`\`

> Great question! This is a pivotal quote.

[source](https://example.com/?utm_source=chatgpt.com)

Plain sentence.`;
  const result = auditText(text);
  assert.deepEqual(result.findings.map((finding) => finding.id), ['tracking-parameter']);
  assert.equal(prepareText(text).split('\n').length, text.split('\n').length);
});

test('audit distinguishes placeholders from Markdown link labels', () => {
  const result = auditText('Read [source](https://example.com). Replace [SOURCE URL] before publishing.');
  const placeholders = result.findings.filter((finding) => finding.id === 'placeholder');
  assert.equal(placeholders.length, 1);
  assert.equal(placeholders[0].match, '[SOURCE URL]');
});

test('include-quotes audits Markdown blockquotes', () => {
  const result = auditText('> Great question! This serves as a testament to progress.', { includeQuotes: true });
  assert.ok(result.findings.some((finding) => finding.id === 'chatbot-artifact'));
  assert.ok(result.findings.some((finding) => finding.id === 'significance-inflation'));
});

test('comparison catches lost and invented invariants', () => {
  const original = 'Acme must cut p99 from 900ms to 40ms by 2026-09-01. See https://example.com/spec.';
  const rewrite = 'Acme should cut p99 from 900ms to 20ms. See https://example.com/new.';
  const result = compareText(original, rewrite);
  assert.equal(result.invariantChange, true);
  assert.ok(result.changes.numbers.missing.includes('40ms'));
  assert.ok(result.changes.numbers.added.includes('20ms'));
  assert.ok(result.changes.dates.missing.includes('2026-09-01'));
  assert.equal(result.modalReview.changed, true);
});

test('directory audit ranks denser candidate first and skips code folders', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-prose-'));
  try {
    fs.writeFileSync(path.join(root, 'clean.md'), 'The worker retries the request twice, then returns the upstream error.');
    fs.writeFileSync(path.join(root, 'slop.md'), 'Great question! This pivotal platform serves as a testament to progress. The future looks bright.');
    fs.mkdirSync(path.join(root, 'node_modules'));
    fs.writeFileSync(path.join(root, 'node_modules', 'ignored.md'), 'Great question! Great question!');
    const results = auditTarget(root);
    assert.equal(path.basename(results[0].file), 'slop.md');
    assert.equal(results.some((result) => result.file.includes('node_modules')), false);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('compare CLI can fail on invariant changes', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'audit-prose-cli-'));
  try {
    const original = path.join(root, 'original.txt');
    const rewrite = path.join(root, 'rewrite.txt');
    fs.writeFileSync(original, 'The limit is 40ms.');
    fs.writeFileSync(rewrite, 'The limit is 20ms.');
    const script = fileURLToPath(new URL('./audit-prose.mjs', import.meta.url));
    const result = spawnSync(process.execPath, [script, 'compare', original, rewrite, '--fail-on-invariant-change']);
    assert.equal(result.status, 2);
    assert.match(result.stdout.toString(), /invariant_change: true/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
