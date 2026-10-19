import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import { ContentSlice } from '../../../packages/plitejs/src/index';

const root = resolve(import.meta.dir, '../../..');
const benchmarkPath = resolve(
  root,
  'benchmarks/editor/benchmarks/plite-content-slice-value-benchmark.ts'
);
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');

describe('ContentSlice value benchmark authority', () => {
  it('measures the live immutable value boundary', () => {
    const source = [
      {
        children: [{ text: 'before' }],
        type: 'paragraph',
      },
    ];
    const closed = ContentSlice.closed(source);
    const decoded = ContentSlice.fromJSON({
      content: source,
      openEnd: 0,
      openStart: 0,
    });

    source[0].children[0] = { text: 'after' };

    assert.deepEqual(closed.content, [
      { children: [{ text: 'before' }], type: 'paragraph' },
    ]);
    assert.deepEqual(decoded.content, closed.content);
    assert.notEqual(closed.content, source);
    assert.equal(Object.isFrozen(closed.content[0].children[0]), true);
    assert.equal(ContentSlice.fromJSON(closed), closed);
    assert.equal(ContentSlice.fromJSON(decoded), decoded);
  });

  it('keeps one registered benchmark and metric owner', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      targets: Array<{
        artifacts: Array<{ path: string }>;
        command: string;
        id: string;
        metrics: { primary: string };
      }>;
    };
    const targets = registry.targets.filter(
      ({ id }) => id === 'plite-content-slice-value'
    );
    const source = readFileSync(benchmarkPath, 'utf-8');

    assert.equal(targets.length, 1);
    assert.match(
      targets[0].command,
      /plite-content-slice-value-benchmark\.ts/u
    );
    assert.equal(
      targets[0].metrics.primary,
      'plite_content_slice_value_trusted_identity_reuse'
    );
    assert.deepEqual(targets[0].artifacts, [
      {
        path: 'tmp/plite-content-slice-value-benchmark.json',
        required: true,
      },
    ]);
    assert.match(
      source,
      /METRIC plite_content_slice_value_trusted_identity_reuse=/u
    );
    assert.match(
      source,
      /METRIC plite_content_slice_value_trusted_preparation_reuse=/u
    );
    assert.match(source, /\{ name: 'tiny', nodes: 10 \}/u);
    assert.match(source, /\{ name: 'normal', nodes: 100 \}/u);
    assert.match(source, /\{ name: 'large', nodes: 1000 \}/u);
    assert.match(source, /\{ name: 'stress', nodes: 10_000 \}/u);
  });
});
