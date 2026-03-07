/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('removeMarks', () => {
  describe('when expanded selection', () => {
    it('removes specified marks', () => {
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

    it('removes multiple marks', () => {
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
    it('removes all marks', () => {
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

    it('triggers onChange by default', () => {
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

      const onChange = mock();
      editor.api.onChange = onChange as any;
      editor.marks = { bold: true };

      editor.tf.removeMarks('bold');

      expect(onChange).toHaveBeenCalled();
    });

    it('does not trigger onChange when change notifications are disabled', () => {
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

      const onChange = mock();
      editor.api.onChange = onChange as any;
      editor.marks = { bold: true };

      editor.tf.removeMarks('bold', { shouldChange: false });

      expect(onChange).not.toHaveBeenCalled();
    });

    it('clears editor.marks when the selection is collapsed', () => {
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

      expect(editor.marks).toEqual({});
    });

    it('removes one mark from editor.marks when the selection is collapsed', () => {
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

      expect(editor.marks).toEqual({ italic: true });
    });
  });

  describe('when at specific range', () => {
    it('remove marks at range without affecting editor.marks', () => {
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
