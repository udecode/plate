/** @jsx jsxt */

import { jsxt, type TestEditor } from '@platejs/test-utils';
import type { Element } from '@platejs/plite';
import { createPlateEditor } from '@platejs/core/react';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';

jsxt;

describe('withInsertFragmentTable', () => {
  // https://github.com/udecode/editor-protocol/issues/13
  describe('when inserting table 2x1 into cell 11', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('replaces the first table column with the inserted column (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
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

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/14
  describe('when inserting table 1x2 into cell 11', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('replaces the first table row with the inserted row (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
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

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/24
  describe('Insert a table when selecting table cells', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('replace these cells (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
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
                <hp>
                  <htext />
                </hp>
              </htd>
              <htd>
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.delete();
      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children!);
    });
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

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children!);

      expect(editor.read.selection()).toEqual(output.selection!);
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
        name: 'with disableMerge: true',
        options: { disableMerge: true },
      },
      {
        name: 'with disableMerge: false',
        options: { disableMerge: false },
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
                <htd background="custom">
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
                <htd background="custom">
                  <hp>ab</hp>
                </htd>
              </htr>
              <htr>
                <htd background="custom">
                  <hp>
                    <htext />
                  </hp>
                </htd>
                <htd background="custom">
                  <hp>ba</hp>
                </htd>
                <htd background="custom">
                  <hp>
                    bb
                    <focus />
                  </hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as TestEditor;

        const plugins = getTestTablePlugins(options, (plugin) =>
          plugin.extendApi(() => ({
            createCell: () => ({
              background: 'custom',
              children: [
                {
                  children: [{ text: '' }],
                  type: 'p',
                },
              ],
              type: 'td',
            }),
          }))
        );

        const editor = createPlateEditor({
          nodeId: true,
          plugins,
          selection: input.selection,
          value: input.children,
        });

        editor.update.fragment.replace(fragment);

        expect(editor.read.children()).toMatchObject(output.children!);
        expect(editor.read.selection()).toEqual(output.selection!);
      });
    });
  });

  describe('when insert table 2x2 into cell 22 with disableExpandOnInsert', () => {
    it('does not expand the table', () => {
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
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
              <htd>
                <hp>
                  <anchor />
                  aa
                  <focus />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({
          disableExpandOnInsert: true,
        }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children!);

      expect(editor.read.selection()).toEqual(output.selection!);
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

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins(),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  describe('logical table grid paste', () => {
    it('splits merged cells that cross the pasted rectangle', () => {
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
              <htd colSpan={2}>
                <hp>e</hp>
              </htd>
              <htd colSpan={2}>
                <hp>f</hp>
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
                <hp>
                  <htext />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;
      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children!);
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
      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge: false }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  // https://github.com/udecode/editor-protocol/issues/64
  describe('when inserting blocks inside a table', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('inserts the blocks without removing the cells (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
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

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        value: input.children,
      });

      editor.update.fragment.replace(fragment);

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });
});
