import assert from 'node:assert/strict';

import { createPlateEditor } from '@platejs/core/react';
import {
  ContentSlice,
  defineEditorExtension,
  editorCommands,
  type Element,
  NodeApi,
  type Value,
} from '@platejs/plite';

import { BaseTablePlugin } from './BaseTablePlugin';

describe('withInsertFragmentTable fitContent', () => {
  for (const openDepth of [0, 1]) {
    it(`delegates a ${openDepth === 0 ? 'closed' : 'open'} table slice outside tables to one core fit and commit`, () => {
      const editor = createPlateEditor<Value>({
        nodeId: true,
        plugins: [BaseTablePlugin],
        selection: {
          anchor: { offset: 3, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
          kind: 'text',
        },
        value: [{ children: [{ text: 'one' }], type: 'p' }],
      });
      const table = {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'cell' }], type: 'p' }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      };
      const slice = ContentSlice.fromJSON({
        content: [table],
        openEnd: openDepth,
        openStart: openDepth,
      });
      const seen: unknown[] = [];

      editor.extend(
        defineEditorExtension({
          commands: ({ handle }) => [
            handle(editorCommands.replaceSlice, ({ input }) => {
              seen.push(input.slice);

              return false;
            }),
          ],
          name: `table-slice-delegation-${openDepth}`,
        })
      );

      const profilerGlobal = globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          acceptsCoreDuration: (id: string) => boolean;
          record: (event: { id: string }) => void;
        };
      };
      const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
      const fitEvents: string[] = [];
      const commits: unknown[] = [];
      const unsubscribe = editor.subscribeCommit((commit) => {
        commits.push(commit);
      });

      profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
        acceptsCoreDuration: (id) => id === 'slice-fit-input',
        record: ({ id }) => {
          if (id) fitEvents.push(id);
        },
      };

      try {
        assert.equal(editor.update.slice.replace(slice), true);
      } finally {
        profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
        unsubscribe();
      }

      assert.equal(seen.length, 1);
      assert.equal(seen[0], slice);
      assert.deepEqual(fitEvents, ['slice-fit-input']);
      assert.equal(commits.length, 1);
    });
  }

  it('delegates a single-cell inline paste to canonical slice replacement', () => {
    const editor = createPlateEditor({
      nodeId: true,
      plugins: [BaseTablePlugin],
      selection: {
        anchor: { offset: 1, path: [0, 0, 0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0, 0, 0] },
        kind: 'text',
      },
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'ab' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    editor.update.fragment.replace([{ text: '?' }]);

    assert.equal(NodeApi.string(editor.read.children()[0]!), 'a?b');
  });

  it('recognizes an open table slice from its retained content context', () => {
    const source = createPlateEditor({
      nodeId: true,
      plugins: [BaseTablePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 1, 0, 0, 0] },
        focus: { offset: 1, path: [0, 2, 0, 0, 0] },
        kind: 'text',
      },
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'before' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
            {
              children: [
                {
                  children: [{ children: [{ text: 'x' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
            {
              children: [
                {
                  children: [{ children: [{ text: 'y' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
            {
              children: [
                {
                  children: [{ children: [{ text: 'after' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });
    const slice = source.read.slice.get();
    const target = createPlateEditor({
      nodeId: true,
      plugins: [BaseTablePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0, 0, 0] },
        kind: 'text',
      },
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'a' }], type: 'p' }],
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: 'b' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    assert(slice.openStart > 0);
    assert(slice.openEnd > 0);
    assert.equal((slice.content[0] as Element).type, 'table');
    target.update.slice.replace(slice);

    const table = target.read.children()[0] as Element;

    assert.deepEqual(
      table.children.map((row) =>
        (row as Element).children.map((cell) => NodeApi.string(cell))
      ),
      [
        ['x', 'b'],
        ['y', ''],
      ]
    );
  });

  it('fits closed text against every selected cell grammar', () => {
    const editor = createPlateEditor({
      nodeId: true,
      plugins: [BaseTablePlugin],
      selection: {
        anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 1, 0, 0] },
        kind: 'text',
      },
      value: [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'a' }], type: 'p' }],
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: 'b' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ],
    });

    editor.update.fragment.replace([{ text: 'plain' }]);

    const table = editor.read.children()[0] as Element;
    const row = table.children[0] as Element;
    const cells = row.children as Element[];

    assert.deepEqual(
      cells.map((cell) => NodeApi.string(cell)),
      ['plain', 'plain']
    );
    assert.deepEqual(
      cells.map((cell) => cell.children.map((child) => child.type)),
      [['p'], ['p']]
    );
  });
});
