import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  definePlugin,
  property,
  schema,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { projectAuthoredFragment } from '../src/authored/tree/resolve';
import { authoredTestApi } from './support/authored';

const struck = { at: 1, author: 'bob', change: 'bob:1', kind: 'delete' };
const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
/** A whole-block suggestion marks the block and every node inside it. */
const whole = (
  node: Record<string, unknown>,
  ...marks: Array<Record<string, unknown>>
): Record<string, unknown> => ({
  ...node,
  authored: [...((node.authored as unknown[] | undefined) ?? []), ...marks],
  ...(Array.isArray(node.children)
    ? {
        children: node.children.map((child: Record<string, unknown>) =>
          whole(child, ...marks)
        ),
      }
    : {}),
});

const Columns = defineEditorSchema('projection-columns', {
  elements: {
    column: { content: schema.content.type('paragraph', { min: 1 }) },
    column_group: { content: schema.content.type('column', { min: 2 }) },
    paragraph: { content: schema.content.text() },
  },
  id: 'projection-columns',
  properties: [
    schema.elementProperty('width', property.number(), {
      target: target.type('column'),
    }),
  ],
  root: schema.content.any(
    [schema.content.type('paragraph'), schema.content.type('column_group')],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'reject',
  version: 1,
});

// Column widths add up to 100, as the column plugin's correction keeps them.
const ColumnWidths = definePlugin('projection-column-widths', {
  corrections: [
    {
      event: 'children',
      query: { type: 'column_group' },
      correct({ entry, tx }) {
        const [group, path] = entry as [
          { children: Array<{ width?: number }> },
          number[],
        ];
        const total = group.children.reduce(
          (sum, column) => sum + (column.width ?? 0),
          0
        );

        if (total === 100 || total === 0) return;
        group.children.forEach((column, index) => {
          tx.nodes.set(
            { width: ((column.width ?? 0) * 100) / total },
            { at: [...path, index] }
          );
        });
      },
    },
  ],
});

describe('authored review tree projections', () => {
  it('reads correction-derived values unrecomputed in the pure proposed read, and names the container', () => {
    const editor = createEditor({
      plugins: [
        Columns,
        ColumnWidths,
        createAuthoredPlugin({ authorId: 'bob' }),
      ],
      initialValue: [
        {
          type: 'column_group',
          children: [
            { type: 'column', width: 25, children: [paragraph('a')] },
            { type: 'column', width: 25, children: [paragraph('b')] },
            whole(
              { type: 'column', width: 50, children: [paragraph('c')] },
              struck
            ),
          ],
        },
      ],
    });
    const proposed = authoredTestApi(editor).project('proposed');

    authoredTestApi(editor).decide({ action: 'accept', changes: ['bob:1'] });

    const widths = (children: readonly unknown[]) =>
      (children[0] as { children: Array<{ width: number }> }).children.map(
        (column) => column.width
      );

    assert.deepEqual(widths(proposed.value.children), [25, 25]);
    assert.deepEqual(widths(editor.read.children()), [50, 50]);
    assert.deepEqual(proposed.diagnostics, [
      {
        code: 'authored-uncorrected',
        message:
          'A decision restructured the children of column_group, and corrections that depend on them did not run.',
        path: [0],
        severity: 'warning',
        type: 'column_group',
      },
    ]);
  });

  it('reads a fragment under a struck table as removed by projecting the whole document first', () => {
    const value = {
      children: [
        whole(
          {
            type: 'table',
            children: [
              {
                type: 'row',
                children: [{ type: 'cell', children: [paragraph('x')] }],
              },
            ],
          },
          struck
        ),
        paragraph('after'),
      ],
    };

    assert.deepEqual(
      projectAuthoredFragment(value, 'proposed', [[0, 0, 0, 0], [1]]),
      [null, paragraph('after')]
    );
    assert.deepEqual(
      projectAuthoredFragment(value, 'accepted', [[0, 0, 0, 0]]),
      [paragraph('x')]
    );
  });

  it('reads the left block of a join as the merged block the projection holds', () => {
    const value = {
      children: [
        paragraph('a'),
        { ...paragraph('b'), authored: [{ ...struck, kind: 'join' }] },
      ],
    };

    assert.deepEqual(projectAuthoredFragment(value, 'proposed', [[0], [1]]), [
      paragraph('ab'),
      null,
    ]);
  });
});
