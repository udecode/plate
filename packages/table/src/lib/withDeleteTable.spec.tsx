/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';

import { getTestTablePlugins } from './__tests__/getTestTablePlugins';
import { preventDeleteTableCell, withDeleteTable } from './withDeleteTable';

jsxt;

describe('withDeleteTable', () => {
  describe('preventDeleteTableCell', () => {
    it('blocks deletion at the start of the current cell', () => {
      const move = mock();
      const start = { offset: 0, path: [0, 0] };
      const editor = {
        api: {
          after: mock(),
          before: mock(),
          block: mock(() => [{ type: 'td' }, [0, 0]]),
          end: mock(),
          isCollapsed: mock(() => true),
          start: mock(() => start),
        },
        getType: (key: string) => key,
        selection: {
          anchor: start,
          focus: start,
        },
        tf: { move },
      } as any;

      expect(preventDeleteTableCell(editor, {})).toBe(true);
      expect(move).not.toHaveBeenCalled();
    });

    it('moves the selection away from an adjacent table cell instead of deleting it', () => {
      const move = mock();
      const block = mock()
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce([{ type: 'td' }, [1, 0]]);
      const editor = {
        api: {
          before: mock(() => ({ offset: 0, path: [1, 0] })),
          block,
          isCollapsed: mock(() => true),
        },
        getType: (key: string) => key,
        selection: {
          anchor: { offset: 0, path: [2, 0] },
          focus: { offset: 0, path: [2, 0] },
        },
        tf: { move },
      } as any;

      expect(preventDeleteTableCell(editor, { unit: 'character' })).toBe(true);
      expect(move).toHaveBeenCalledWith({ reverse: true });
    });
  });

  // https://github.com/udecode/editor-protocol/issues/21
  // https://github.com/udecode/editor-protocol/issues/25
  describe('Delete when selecting cells', () => {
    describe.each([
      { disableMerge: true },
      { disableMerge: false },
    ])('with disableMerge: $disableMerge', ({ disableMerge }) => {
      let editor: any;
      let output: any;

      beforeEach(() => {
        const input = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <anchor />
                  11
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  21
                  <focus />
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        output = (
          <editor>
            <htable>
              <htr>
                <htd>
                  <hp>
                    <htext />
                    <anchor />
                  </hp>
                </htd>
                <htd>
                  <hp>12</hp>
                </htd>
              </htr>
              <htr>
                <htd>
                  <hp>
                    <htext />
                    <focus />
                  </hp>
                </htd>
                <htd>
                  <hp>22</hp>
                </htd>
              </htr>
            </htable>
          </editor>
        ) as any as SlateEditor;

        editor = createSlateEditor({
          nodeId: true,
          plugins: getTestTablePlugins({ disableMerge }),
          selection: input.selection,
          value: input.children,
        });

        editor.tf.deleteFragment();
      });

      it('remove the cells content', () => {
        expect(editor.children).toMatchObject(output.children);
      });

      it('set the selection to the last cell', () => {
        expect(editor.selection).toEqual(output.selection);
      });
    });
  });

  it('falls back to the original deleteFragment when the selection is not a table block', () => {
    const deleteFragment = mock();
    const transforms = withDeleteTable({
      editor: {
        api: {
          isAt: () => false,
        },
      } as any,
      tf: { deleteFragment },
      type: 'table',
    } as any).transforms;

    transforms!.deleteFragment!({ direction: 'forward' });

    expect(deleteFragment).toHaveBeenCalledWith({ direction: 'forward' });
  });
});
