/** @jsxRuntime classic */
/** @jsx jsxt */

import assert from 'node:assert/strict';

import {
  jsxt,
  projectTestSelectionRange,
  type TestEditor,
} from '#platejs-test-internal';

import type { Element } from '../../../core';
import { ContentSlice, NodeApi, editorCommands } from '../../../core';
import { defineRuntimePlugin } from '../../../facade';
import {
  createTestTableEditor,
  getTestTablePlugins,
} from './__tests__/getTestTablePlugins';
import { BaseTablePlugin } from './BaseTablePlugin';

describe('table clipboard slow contracts', () => {
  jsxt;

  describe('when inserting table 2x1 into cell 11', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'replaces the first table column with the inserted column (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Element[];

        const output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>b</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.fragment.replace(fragment);

        expect(editor.read.children()).toMatchObject(output.children);
      }
    );
  });

  // https://github.com/udecode/editor-protocol/issues/14
  describe('when inserting table 1x2 into cell 11', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'replaces the first table row with the inserted row (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    11
                    <cursor />
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Element[];

        const output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.fragment.replace(fragment);

        expect(editor.read.children()).toMatchObject(output.children);
      }
    );
  });

  // https://github.com/udecode/editor-protocol/issues/24
  describe('Insert a table when selecting table cells', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'replace these cells (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    11
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>
                    22
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Element[];

        const output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>a</hp>
                </htd>
                <htd>
                  <hp>b</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.fragment.delete();
        editor.update.fragment.replace(fragment);

        expect(editor.read.children()).toMatchObject(output.children);
      }
    );
  });

  // https://github.com/udecode/editor-protocol/issues/20
  describe('when inserting table 2x1 into cell 12', () => {
    it('replaces the second table column with the inserted column', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>
                  12
                  <cursor />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>22</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>b</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Element[];

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>
                  <anchor />a
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>
                  b<focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children);

      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(output.selection)
      );
    });
  });

  // https://github.com/udecode/editor-protocol/issues/32
  describe('when insert table 2x2 into cell 22', () => {
    const cases = [
      {
        name: 'default',
        options: {},
      },
      {
        name: 'with allowCellSpanEditing: false',
        options: { allowCellSpanEditing: false },
      },
      {
        name: 'with allowCellSpanEditing: true',
        options: { allowCellSpanEditing: true },
      },
    ];

    cases.forEach(({ name, options }) => {
      it(name, () => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>
                    22
                    <cursor />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <htable>
              <htr>
                <htd>
                  <hp>aa</hp>
                </htd>
                <htd>
                  <hp>ab</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>ba</hp>
                </htd>
                <htd>
                  <hp>bb</hp>
                </htd>
              </htr>
            </htable>
          </fragment>
        ) as Element[];

        const output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>11</hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>21</hp>
                </htd>
                <htd>
                  <hp>
                    <anchor />
                    aa
                  </hp>
                </htd>
                <htd>
                  <hp>ab</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd>
                  <hp>ba</hp>
                </htd>
                <htd>
                  <hp>
                    bb
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: [
            BaseTablePlugin.configure({
              initialState: {
                allowCellSpanEditing: false,
                ...options,
              },
            }),
          ],
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.fragment.replace(fragment);

        expect(editor.read.children()).toMatchObject(output.children);
        expect(editor.read.selection()).toEqual(
          projectTestSelectionRange(output.selection)
        );
      });
    });
  });

  it('updates column widths when table paste grows past the right edge', () => {
    const input = (
      <editor>
        <htable columnWidths={[20, 30]}>
          <htr>
            <htd>
              <hp>11</hp>
            </htd>
            <htd>
              <hp>
                12
                <cursor />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
            <htd>
              <hp>22</hp>
            </htd>
          </htr>
        </htable>
      </editor>
    ) as TestEditor;
    const fragment = (
      <fragment>
        <htable>
          <htr>
            <htd>
              <hp>a</hp>
            </htd>
            <htd>
              <hp>b</hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>c</hp>
            </htd>
            <htd>
              <hp>d</hp>
            </htd>
          </htr>
        </htable>
      </fragment>
    ) as Element[];
    const editor = createTestTableEditor({
      plugins: getTestTablePlugins({
        defaultTableWidth: 100,
        minColumnWidth: 10,
      }),
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.fragment.replace(fragment);

    expect(editor.read.children()[0]).toMatchObject({
      columnWidths: [20, 30, 30],
    });
  });

  describe('when a table paste overflows with expansion disabled', () => {
    it('rejects overflow without changing content or selection', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>
                  22
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>aa</hp>
              </htd>
              <htd>
                <hp>ab</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>ba</hp>
              </htd>
              <htd>
                <hp>bb</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Element[];

      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({
          expandOnPaste: false,
        }),
        selection: input.selection,
        initialValue: input.children,
      });

      expect(editor.update.fragment.replace(fragment)).toBe(false);

      expect(editor.read.children()).toMatchObject(input.children);

      expect(editor.read.selection()).toEqual(
        projectTestSelectionRange(input.selection)
      );
    });
  });

  // https://github.com/udecode/editor-protocol/issues/63
  describe('when inserting table cells with multiple p', () => {
    it('paste', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11a</hp>
                <hp>
                  11b
                  <cursor />
                </hp>
              </htd>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>o11a</hp>
                <hp>o11b</hp>
              </htd>
              <htd>
                <hp>o12</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Element[];

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>o11a</hp>
                <hp>o11b</hp>
              </htd>
              <htd>
                <hp>o12</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createTestTableEditor({
        plugins: getTestTablePlugins(),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children);
    });
  });

  describe('logical table grid paste', () => {
    it('splits a merged cell fully covered by the pasted rectangle', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
                <hp>
                  b<cursor />
                </hp>
              </htd>
              <htd>
                <hp>c</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>e</hp>
              </htd>
              <htd colSpan={2}>
                <hp>f</hp>
              </htd>
              <htd>
                <hp>g</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>x</hp>
              </htd>
              <htd>
                <hp>y</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>z</hp>
              </htd>
              <htd>
                <hp>q</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Element[];
      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>a</hp>
              </htd>
              <htd>
                <hp>x</hp>
              </htd>
              <htd>
                <hp>y</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>e</hp>
              </htd>
              <htd>
                <hp>z</hp>
              </htd>
              <htd>
                <hp>q</hp>
              </htd>
              <htd>
                <hp>g</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
        selection: input.selection,
        initialValue: input.children,
      });

      expect(editor.update.fragment.replace(fragment)).toBe(true);

      expect(editor.read.children()).toMatchObject(output.children);
      expect(
        editor.plugin(BaseTablePlugin).read.cell({ at: [0, 1, 1] })?.colSpan
      ).toBe(1);
      expect(
        editor.plugin(BaseTablePlugin).read.cell({ at: [0, 1, 2] })?.colSpan
      ).toBe(1);
    });

    it('fills a non-rectangular fragment before pasting it', () => {
      const input = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>
                  a<cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const fragment = (
        <fragment>
          <htable>
            <htr>
              <htd>
                <hp>b</hp>
              </htd>
              <htd>
                <hp>c</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
            <htr>
              <htd colSpan={2} rowSpan={2}>
                <hp>e</hp>
              </htd>
            </htr>
          </htable>
        </fragment>
      ) as Element[];
      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>b</hp>
              </htd>
              <htd>
                <hp>c</hp>
              </htd>
              <htd>
                <hp>d</hp>
              </htd>
            </htr>
            <htr>
              <htd colSpan={2} rowSpan={2}>
                <hp>e</hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const editor = createTestTableEditor({
        plugins: getTestTablePlugins({ allowCellSpanEditing: true }),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/64
  describe('when inserting blocks inside a table', () => {
    it.each([{ allowCellSpanEditing: false }, { allowCellSpanEditing: true }])(
      'inserts the blocks without removing the cells (allowCellSpanEditing: $allowCellSpanEditing)',
      ({ allowCellSpanEditing }) => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <anchor />
                    11
                  </hp>
                </htd>
                <htd>
                  <hp>
                    12
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const fragment = (
          <fragment>
            <hp>o11a</hp>
            <hp>o11b</hp>
          </fragment>
        ) as Element[];

        const output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>o11a</hp>
                  <hp>o11b</hp>
                </htd>
                <htd>
                  <hp>o11a</hp>
                  <hp>o11b</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const editor = createTestTableEditor({
          plugins: getTestTablePlugins({ allowCellSpanEditing }),
          selection: input.selection,
          initialValue: input.children,
        });

        editor.update.fragment.replace(fragment);

        expect(editor.read.children()).toMatchObject(output.children);
      }
    );
  });

  describe('BaseTablePlugin insertFragment fitContent', () => {
    for (const openDepth of [0, 1]) {
      it(`delegates a ${openDepth === 0 ? 'closed' : 'open'} table slice outside tables to one core fit and commit`, () => {
        const editor = createTestTableEditor({
          plugins: [BaseTablePlugin],
          selection: {
            anchor: { offset: 3, path: [0, 0] },
            focus: { offset: 3, path: [0, 0] },
            kind: 'text',
          },
          initialValue: [{ children: [{ text: 'one' }], type: 'paragraph' }],
        });
        const table = {
          children: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'cell' }], type: 'paragraph' },
                  ],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
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

        editor.install(
          defineRuntimePlugin(`table-slice-delegation-${openDepth}`, {
            commands: ({ handle }) => [
              handle(editorCommands.replaceSlice, ({ input }) => {
                seen.push(input.slice);

                return false;
              }),
            ],
          })
        );

        const profilerGlobal = globalThis as typeof globalThis & {
          __EDITOR_REACT_RENDER_PROFILER__?: {
            acceptsCoreDuration: (id: string) => boolean;
            record: (event: { id: string }) => void;
          };
        };
        const previousProfiler =
          profilerGlobal.__EDITOR_REACT_RENDER_PROFILER__;
        const fitEvents: string[] = [];
        const commits: unknown[] = [];
        const unsubscribe = editor.subscribeCommit((commit) => {
          commits.push(commit);
        });

        profilerGlobal.__EDITOR_REACT_RENDER_PROFILER__ = {
          acceptsCoreDuration: (id) => id === 'slice-fit-input',
          record: ({ id }) => {
            if (id) fitEvents.push(id);
          },
        };

        try {
          assert.equal(editor.update.slice.replace(slice), true);
        } finally {
          profilerGlobal.__EDITOR_REACT_RENDER_PROFILER__ = previousProfiler;
          unsubscribe();
        }

        assert.equal(seen.length, 1);
        assert.equal(seen[0], slice);
        assert.deepEqual(fitEvents, ['slice-fit-input']);
        assert.equal(commits.length, 1);
      });
    }

    it('delegates a single-cell inline paste to canonical slice replacement', () => {
      const editor = createTestTableEditor({
        plugins: [BaseTablePlugin],
        selection: {
          anchor: { offset: 1, path: [0, 0, 0, 0, 0] },
          focus: { offset: 1, path: [0, 0, 0, 0, 0] },
          kind: 'text',
        },
        initialValue: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      { children: [{ text: 'ab' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ],
      });

      editor.update.fragment.replace([{ text: '?' }]);

      assert.equal(NodeApi.string(editor.read.children()[0]), 'a?b');
    });

    it('delegates an open table slice to canonical fitting', () => {
      const source = createTestTableEditor({
        plugins: [BaseTablePlugin],
        selection: {
          anchor: { offset: 0, path: [0, 1, 0, 0, 0] },
          focus: { offset: 1, path: [0, 2, 0, 0, 0] },
          kind: 'text',
        },
        initialValue: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      { children: [{ text: 'before' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  {
                    children: [
                      { children: [{ text: 'x' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  {
                    children: [
                      { children: [{ text: 'y' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
              {
                children: [
                  {
                    children: [
                      { children: [{ text: 'after' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ],
      });
      const slice = source.read.slice.get();
      const target = createTestTableEditor({
        plugins: [BaseTablePlugin],
        selection: {
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 0, path: [0, 0, 0, 0, 0] },
          kind: 'text',
        },
        initialValue: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      { children: [{ text: 'a' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                  {
                    children: [
                      { children: [{ text: 'b' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
              },
            ],
            type: 'table',
          },
        ],
      });

      assert.ok(slice.openStart > 0);
      assert.ok(slice.openEnd > 0);
      assert.equal((slice.content[0] as Element).type, 'table');
      target.update.slice.replace(slice);

      const table = target.read.children()[0] as Element;

      assert.deepEqual(
        table.children.map((row) =>
          (row as Element).children.map((cell) => NodeApi.string(cell))
        ),
        [
          ['x', ''],
          ['ya', 'b'],
        ]
      );
    });

    it('fits closed text against every selected cell grammar', () => {
      const editor = createTestTableEditor({
        plugins: [BaseTablePlugin],
        selection: {
          anchor: { offset: 0, path: [0, 0, 0, 0, 0] },
          focus: { offset: 1, path: [0, 0, 1, 0, 0] },
          kind: 'text',
        },
        initialValue: [
          {
            children: [
              {
                children: [
                  {
                    children: [
                      { children: [{ text: 'a' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                  {
                    children: [
                      { children: [{ text: 'b' }], type: 'paragraph' },
                    ],
                    type: 'tableCell',
                  },
                ],
                type: 'tableRow',
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
        [['paragraph'], ['paragraph']]
      );
    });
  });
});
