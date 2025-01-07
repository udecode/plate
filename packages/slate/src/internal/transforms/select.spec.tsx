/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createEditor } from '../../createEditor';

jsx;

describe('select', () => {
  describe('when edge option', () => {
    it('should select end of block', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
            <hp>test2</hp>
          </editor>
        ) as any
      );

      editor.tf.select(editor.selection!, { edge: 'end' });

      expect(editor.selection).toEqual({
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });
    });

    it('should select start of block', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
            <hp>test2</hp>
          </editor>
        ) as any
      );

      editor.tf.select(editor.selection!, { edge: 'start' });

      expect(editor.selection).toEqual({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      });
    });

    it('should select edge of specified block', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>test</hp>
            <hp>test2</hp>
          </editor>
        ) as any
      );

      editor.tf.select([1], { edge: 'end' });

      expect(editor.selection!).toEqual({
        anchor: { offset: 5, path: [1, 0] },
        focus: { offset: 5, path: [1, 0] },
      });
    });
  });
});
