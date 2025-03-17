/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('select', () => {
  describe('when edge option', () => {
    describe('block edges', () => {
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

  describe('when at is defined', () => {
    it('should select at specific point', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              hello
              <cursor />
            </hp>
            <element>
              <hp>world</hp>
            </element>
          </editor>
        ) as any
      );

      editor.tf.select({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });

      expect(editor.selection).toEqual({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
    });
  });

  describe('when focus option', () => {
    it('should focus editor before selecting', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              hello
              <cursor />
            </hp>
            <element>
              <hp>world</hp>
            </element>
          </editor>
        ) as any
      );

      const focusSpy = jest.spyOn(editor.tf, 'focus');

      editor.tf.select([], {
        edge: 'end',
        focus: true,
      });

      expect(focusSpy).toHaveBeenCalled();
      expect(editor.selection).toEqual({
        anchor: { offset: 5, path: [1, 0, 0] },
        focus: { offset: 5, path: [1, 0, 0] },
      });

      focusSpy.mockRestore();
    });

    it('should focus editor before selecting at specific point', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              hello
              <cursor />
            </hp>
            <element>
              <hp>world</hp>
            </element>
          </editor>
        ) as any
      );

      const focusSpy = jest.spyOn(editor.tf, 'focus');

      editor.tf.select(
        {
          anchor: { offset: 1, path: [0, 0] },
          focus: { offset: 1, path: [0, 0] },
        },
        { focus: true }
      );

      expect(focusSpy).toHaveBeenCalled();
      expect(editor.selection).toEqual({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });

      focusSpy.mockRestore();
    });
  });

  describe('when sibling option', () => {
    it('should select start of next sibling', () => {
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

      editor.tf.select([0], { next: true });

      expect(editor.selection).toEqual({
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      });
    });

    it('should select end of previous sibling', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>test</hp>
            <hp>
              test2
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      editor.tf.select([1], { previous: true });

      expect(editor.selection).toEqual({
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });
    });

    it('should focus when selecting sibling', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>test</hp>
            <hp>
              test2
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      const focusSpy = jest.spyOn(editor.tf, 'focus');

      editor.tf.select([1], { focus: true, previous: true });

      expect(focusSpy).toHaveBeenCalled();
      expect(editor.selection).toEqual({
        anchor: { offset: 4, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      });

      focusSpy.mockRestore();
    });
  });
});
