import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  schema,
} from '../../../packages/plitejs/src/index';

const root = resolve(import.meta.dir, '../../..');
const benchmarkPath = resolve(
  root,
  'benchmarks/editor/benchmarks/plite-fit-content-locality-benchmark.ts'
);
const registryPath = resolve(root, 'benchmarks/targets/slate-v2.json');

describe('fitContent locality benchmark authority', () => {
  it('exercises the live detached fitting API without publishing', () => {
    const definition = defineEditorSchema(
      'schema:fit-content-locality-authority',
      {
        elements: {
          cell: {
            content: schema.content.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        id: 'fit-content-locality-authority',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }
    );
    const editor = createEditor({
      extensions: [definition],
      initialValue: [{ children: [{ text: 'document' }], type: 'paragraph' }],
    });
    const children = editor.read.children();
    const fitted = editor.read.slice.fitContent(
      ContentSlice.closed([{ text: 'detached' }]),
      {
        parent: {
          children: [{ children: [{ text: '' }], type: 'paragraph' }],
          type: 'cell',
        },
      }
    );

    assert.deepEqual(fitted, [
      { children: [{ text: 'detached' }], type: 'paragraph' },
    ]);
    assert.equal(editor.read.children(), children);
    assert.equal(editor.read.lastCommit(), null);
  });

  it('keeps one registered width-locality owner and exact corpus labels', () => {
    const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      targets: Array<{
        artifacts: Array<{ path: string; required: boolean }>;
        command: string;
        id: string;
        metrics: { primary: string };
      }>;
    };
    const targets = registry.targets.filter(
      ({ id }) => id === 'plite-fit-content-locality'
    );
    const source = readFileSync(benchmarkPath, 'utf-8');

    assert.equal(targets.length, 1);
    assert.match(
      targets[0].command,
      /plite-fit-content-locality-benchmark\.ts/u
    );
    assert.equal(
      targets[0].metrics.primary,
      'plite_fit_content_document_width_ratio'
    );
    assert.deepEqual(targets[0].artifacts, [
      {
        path: 'tmp/plite-fit-content-locality-benchmark.json',
        required: true,
      },
    ]);
    assert.match(source, /\[10, 1000, 10_000, 50_000\]/u);
    assert.match(source, /\[5, 50, 100\]/u);
    assert.match(source, /\[1, 10, 100\]/u);
    assert.match(source, /METRIC plite_fit_content_document_width_ratio=/u);
    assert.match(source, /METRIC plite_fit_content_total_measured_calls=/u);
  });
});
