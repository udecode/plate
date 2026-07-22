/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';

import { jsxt, type TestEditor } from '@platejs/test-utils';

import { getTestTablePlugins } from '../__tests__/getTestTablePlugins';

jsxt;

describe('deleteColumn', () => {
  it.each([
    { disableMerge: true },
    { disableMerge: false },
  ])('removes the table when deleting its last column (disableMerge: $disableMerge)', ({
    disableMerge,
  }) => {
    const input = (
      <editor>
        <hp>before</hp>
        <htable>
          <htr>
            <htd>
              <hp>
                11
                <cursor />
              </hp>
            </htd>
          </htr>
          <htr>
            <htd>
              <hp>21</hp>
            </htd>
          </htr>
        </htable>
        <hp>after</hp>
      </editor>
    ) as TestEditor;

    const editor = createPlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins({ disableMerge }),
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.remove.tableColumn();

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'before' }], type: 'p' },
      { children: [{ text: 'after' }], type: 'p' },
    ]);
  });

  describe('when 2x2', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('deletes a column (disableMerge: $disableMerge)', ({ disableMerge }) => {
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

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.remove.tableColumn();

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 12', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('deletes cell 12 (disableMerge: $disableMerge)', ({ disableMerge }) => {
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
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>11</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.remove.tableColumn();

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 11', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('deletes cell 11 (disableMerge: $disableMerge)', ({ disableMerge }) => {
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
              <htd colSpan={2}>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <htable>
            <htr>
              <htd>
                <hp>12</hp>
              </htd>
            </htr>
            <htr>
              <htd>
                <hp>21</hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

      const editor = createPlateEditor({
        nodeId: true,
        plugins: getTestTablePlugins({ disableMerge }),
        selection: input.selection,
        initialValue: input.children,
      });

      editor.update.remove.tableColumn();

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  describe('when first row has 2 cells, second row has 1 cell, focus 21', () => {
    it.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('keeps the table unchanged when no second-column match exists (disableMerge: $disableMerge)', ({
      disableMerge,
    }) => {
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
                <hp>
                  21
                  <cursor />
                </hp>
              </htd>
            </htr>
          </htable>
        </editor>
      ) as TestEditor;

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
                <hp>
                  21
                  <cursor />
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
        initialValue: input.children,
      });

      editor.update.remove.tableColumn();

      expect(editor.read.children()).toMatchObject(output.children!);
    });
  });

  it('shrinks table colSizes when deleting a column', () => {
    const input = (
      <editor>
        <htable colSizes={[40, 60]}>
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

    const editor = createPlateEditor({
      nodeId: true,
      plugins: getTestTablePlugins({ disableMerge: true }),
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.remove.tableColumn();

    expect(editor.read.children()).toMatchObject([
      {
        colSizes: [40],
        type: 'table',
      },
    ]);
  });

  it('deletes a selected column spanning every row', () => {
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
              <hp>
                21
                <focus />
              </hp>
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
      plugins: getTestTablePlugins({ disableMerge: true }),
      selection: input.selection,
      initialValue: input.children,
    });
    editor.update.remove.tableColumn();

    expect(editor.read.text.string([0])).toBe('1222');
    expect(
      editor.read.nodes.toArray({ at: [], match: { type: 'td' } })
    ).toHaveLength(2);
  });
});
