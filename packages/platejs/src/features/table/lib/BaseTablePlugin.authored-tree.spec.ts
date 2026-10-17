import assert from 'node:assert/strict';

import { createAuthoredPlugin } from 'plitejs/authored';
import { writeDOMFragmentData } from 'plitejs/dom';
import * as Y from 'yjs';

import { authoredTestApi } from '../../../authored/__tests__/authoredTestApi';
import { ContentSlice, createEditor } from '../../../core';
import { YjsPlugin } from '../../../yjs/react';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';

// Phase 1 of docs/plans/2026-10-08-authored-review.md: the table rule on the
// real table plugin with two clients. The phase's revert deletes this spec.

type Node = {
  authored?: unknown;
  children?: Node[];
  text?: string;
  type?: string;
};

const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});

const peer = (
  authorId: string,
  doc: Y.Doc,
  intent: 'edit' | 'propose',
  seed: boolean
) => {
  let count = 0;
  const proof = createAuthoredPlugin({
    authorId,
    createChangeId: () => {
      count += 1;

      return `${authorId}:${count}`;
    },
    intent,
    now: () => 1,
    // Pending table changes arrive as loaded content while Suggesting
    // refuses tables.
    vetoes: false,
  });
  const editor = createEditor({
    initialValue: [paragraph('before')],
    plugins: [
      ...getTestTablePlugins(),
      proof,
      YjsPlugin.create({
        doc,
        initialReady: true,
        ...(seed ? { seed: true } : {}),
      }),
    ],
  });

  return { decide: authoredTestApi(editor).decide, editor };
};

const deliver = (from: Y.Doc, to: Y.Doc) => {
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));
};

/** Types, text and marks only, so table ids and sizes do not matter. */
const shape = (nodes: readonly Node[]): unknown[] =>
  nodes.map((node) =>
    node.children
      ? {
          ...(node.authored ? { authored: true } : {}),
          children: shape(node.children),
          type: node.type,
        }
      : `${node.text}${node.authored ? '*' : ''}`
  );

describe('table rule on the review tree', () => {
  for (const [action, expected] of [
    [
      'accept',
      [
        { children: ['before'], type: 'paragraph' },
        {
          children: [
            {
              children: [
                {
                  children: [{ children: ['aX'], type: 'paragraph' }],
                  type: 'tableCell',
                },
                {
                  children: [{ children: ['b'], type: 'paragraph' }],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
      ],
    ],
    ['reject', [{ children: ['before'], type: 'paragraph' }]],
  ] as const) {
    for (const order of [
      'typing delivered first',
      'decision delivered first',
    ]) {
      it(`keeps Editing text in another person's pending table cell when the table is ${action}ed, ${order}`, () => {
        const bobDoc = new Y.Doc();
        const aliceDoc = new Y.Doc();
        const bob = peer('bob', bobDoc, 'propose', true);

        deliver(bobDoc, aliceDoc);
        const alice = peer('alice', aliceDoc, 'edit', false);

        bob.editor.update((tx) =>
          tx.nodes.insert(
            {
              children: [
                {
                  children: ['a', 'b'].map((text) => ({
                    children: [paragraph(text)],
                    type: 'tableCell',
                  })),
                  type: 'tableRow',
                },
              ],
              type: 'table',
            },
            { at: [1] }
          )
        );
        deliver(bobDoc, aliceDoc);
        alice.editor.update((tx) =>
          tx.text.insert('X', { at: { offset: 1, path: [1, 0, 0, 0, 0] } })
        );
        assert.equal(
          bob.decide({ action, changes: ['bob:1'] }).status,
          'applied'
        );
        if (order === 'typing delivered first') {
          deliver(aliceDoc, bobDoc);
          deliver(bobDoc, aliceDoc);
        } else {
          deliver(bobDoc, aliceDoc);
          deliver(aliceDoc, bobDoc);
        }

        for (const { editor } of [alice, bob]) {
          assert.deepEqual(shape(editor.read.children() as Node[]), expected);
        }
      });
    }
  }

  it('drops review marks from foreign text pasted at a caret in a table cell', () => {
    const forged = {
      at: 1,
      author: 'mallory',
      change: 'mallory:1',
      kind: 'insert',
    };
    const cell = (text: string) => ({
      children: [paragraph(text)],
      type: 'tableCell',
    });
    const editor = createTestTableEditor({
      initialValue: [
        {
          children: [{ children: [cell('a'), cell('b')], type: 'tableRow' }],
          type: 'table',
        },
      ],
      plugins: [
        ...getTestTablePlugins(),
        createAuthoredPlugin({ authorId: 'bob', intent: 'edit', now: () => 1 }),
      ],
      selection: {
        anchor: { offset: 1, path: [0, 0, 0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0, 0, 0] },
        kind: 'text',
      },
    });
    const data = new DataTransfer();

    // Written as a foreign payload: the editor's own copy drops review marks.
    writeDOMFragmentData(data, {
      html: () => '',
      slice: ContentSlice.fromJSON({
        content: [{ authored: [forged], text: 'x' }],
        openEnd: 0,
        openStart: 0,
      }),
      text: 'x',
    });

    assert.equal(editor.api.dom.clipboard.insertData(data), true);
    assert.deepEqual(shape(editor.read.children() as Node[]), [
      {
        children: [
          {
            children: [
              {
                children: [{ children: ['ax'], type: 'paragraph' }],
                type: 'tableCell',
              },
              {
                children: [{ children: ['b'], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ]);
  });
});

// S2 of docs/plans/2026-10-10-authored-values.md: the table repair skips rows
// and cells a pending suggestion deletes.
describe('table repair beside a pending row deletion', () => {
  const cell = (text: string, rowSpan?: number) => ({
    children: [paragraph(text)],
    type: 'tableCell',
    ...(rowSpan ? { rowSpan } : {}),
  });
  const row = (...cells: Array<ReturnType<typeof cell>>) => ({
    children: cells,
    type: 'tableRow',
  });
  const make = () => {
    const proof = createAuthoredPlugin({
      authorId: 'alice',
      createChangeId: () => 'alice:1',
      intent: 'edit',
      now: () => 1,
      vetoes: false,
    });
    const editor = createTestTableEditor({
      initialValue: [
        {
          children: [
            row(cell('11'), cell('12', 2)),
            row(cell('21')),
            row(cell('31'), cell('32')),
          ],
          type: 'table',
        },
      ],
      plugins: [...getTestTablePlugins({ allowCellSpanEditing: true }), proof],
      selection: {
        anchor: { offset: 0, path: [0, 1, 0, 0, 0] },
        focus: { offset: 0, path: [0, 1, 0, 0, 0] },
        kind: 'text',
      },
    });

    return { api: authoredTestApi(editor), editor };
  };
  const typeAfter31 = (editor: ReturnType<typeof make>['editor']) =>
    editor.update((tx) => {
      const [, path] = tx.nodes.find({
        at: [],
        match: (node) => 'text' in node && node.text === '31',
      })!;

      tx.text.insert('z', { at: { offset: 2, path } });
    });

  it('adds no cell when Editing types beside a row whose merged cell a suggestion shortened', () => {
    const editing = make();

    editing.editor.update.table.removeRow();
    typeAfter31(editing.editor);

    const decided = (action: 'accept' | 'reject') => {
      const run = make();

      run.api.propose('bob:1', (tx) => tx.table.removeRow());
      typeAfter31(run.editor);
      run.api.decide({ action, changes: ['bob:1'] });

      return shape(run.editor.read.children() as Node[]);
    };

    expect({
      accept: decided('accept'),
      reject: decided('reject'),
    }).toEqual({
      accept: shape(editing.editor.read.children() as Node[]),
      reject: shape([
        {
          children: [
            row(cell('11'), cell('12', 2)),
            row(cell('21')),
            row(cell('31z'), cell('32')),
          ],
          type: 'table',
        },
      ]),
    });
  });
});
