/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('removeMarks', () => {
  describe('when expanded selection', () => {
    it('should remove specified marks', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              te
              <anchor />
              <htext bold italic>
                st
              </htext>
              <focus />
              ing
            </hp>
          </editor>
        ) as any
      );

      editor.tf.removeMarks('bold');

      expect(editor.children).toEqual([
        {
          children: [
            { text: 'te' },
            { italic: true, text: 'st' },
            { text: 'ing' },
          ],
          type: 'p',
        },
      ]);
    });

    it('should remove multiple marks', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              te
              <anchor />
              <htext bold italic>
                st
              </htext>
              <focus />
              ing
            </hp>
          </editor>
        ) as any
      );

      editor.tf.removeMarks(['bold', 'italic']);

      expect(editor.children).toEqual([
        {
          children: [{ text: 'testing' }],
          type: 'p',
        },
      ]);
    });
  });

  describe('when collapsed selection', () => {
    it('should remove all marks', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              te
              <cursor />
              st
            </hp>
          </editor>
        ) as any
      );

      editor.marks = { bold: true, italic: true };
      editor.tf.removeMarks();

      expect(editor.marks).toEqual({});
    });

    it('should trigger onChange by default', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              te
              <cursor />
              st
            </hp>
          </editor>
        ) as any
      );

      const onChange = jest.fn();
      editor.api.onChange = onChange;
      editor.marks = { bold: true };

      editor.tf.removeMarks('bold');

      expect(onChange).toHaveBeenCalled();
    });

    it('should not trigger onChange when shouldChange=false', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              te
              <cursor />
              st
            </hp>
          </editor>
        ) as any
      );

      const onChange = jest.fn();
      editor.api.onChange = onChange;
      editor.marks = { bold: true };

      editor.tf.removeMarks('bold', { shouldChange: false });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('should remove marks when selection is collapsed', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              <htext>te</htext>
              <htext bold italic>
                st
              </htext>
              <cursor />
              <htext>ing</htext>
            </hp>
          </editor>
        ) as any
      );

      editor.marks = { bold: true, italic: true };
      editor.tf.removeMarks(['bold', 'italic']);

      expect(editor.children).toEqual([
        {
          children: [
            { text: 'te' },
            { bold: true, italic: true, text: 'st' },
            { text: 'ing' },
          ],
          type: 'p',
        },
      ]);

      // Should update editor.marks
      expect(editor.marks).toEqual({});
    });

    it('should remove specific mark when selection is collapsed', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              te
              <cursor />
              <htext bold italic>
                st
              </htext>
              ing
            </hp>
          </editor>
        ) as any
      );

      editor.marks = { bold: true, italic: true };
      editor.tf.removeMarks('bold');

      expect(editor.children).toEqual([
        {
          children: [
            { text: 'te' },
            { bold: true, italic: true, text: 'st' },
            { text: 'ing' },
          ],
          type: 'p',
        },
      ]);

      // Should only remove bold from editor.marks
      expect(editor.marks).toEqual({ italic: true });
    });
  });

  describe('when at specific range', () => {
    it('should remove marks at range without affecting editor.marks', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              te
              <htext bold italic>
                st
              </htext>
              ing
            </hp>
          </editor>
        ) as any
      );

      editor.marks = { bold: true, italic: true };

      const at = {
        anchor: { offset: 0, path: [0, 1] },
        focus: { offset: 2, path: [0, 1] },
      };

      editor.tf.removeMarks('bold', { at });

      expect(editor.children).toEqual([
        {
          children: [
            { text: 'te' },
            { italic: true, text: 'st' },
            { text: 'ing' },
          ],
          type: 'p',
        },
      ]);

      expect(editor.marks).toEqual({ bold: true, italic: true });
    });
  });
});
