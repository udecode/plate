/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('insertText', () => {
  describe('when marks is false', () => {
    it('should insert text without marks', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>existing </htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>existing text</htext>
          </hp>
        </editor>
      ) as any;

      input.selection = {
        anchor: { offset: 9, path: [0, 0] },
        focus: { offset: 9, path: [0, 0] },
      };
      input.marks = { bold: true };
      input.tf.insertText('text', { marks: false });

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when marks are present', () => {
    it('should insert text with marks', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>existing </htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>existing </htext>
            <htext bold={true}>bold text</htext>
          </hp>
        </editor>
      ) as any;

      input.selection = {
        anchor: { offset: 9, path: [0, 0] },
        focus: { offset: 9, path: [0, 0] },
      };
      input.marks = { bold: true };
      input.tf.insertText('bold text');

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when no marks are present', () => {
    it('should insert plain text', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>existing </htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>existing plain text</htext>
          </hp>
        </editor>
      ) as any;

      input.selection = {
        anchor: { offset: 9, path: [0, 0] },
        focus: { offset: 9, path: [0, 0] },
      };
      input.marks = null;
      input.tf.insertText('plain text');

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when selection is null', () => {
    it('should not insert text', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>existing text</htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>existing text</htext>
          </hp>
        </editor>
      ) as any;

      input.selection = null;
      input.marks = { bold: true };
      input.tf.insertText('new text');

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when inserting at specific path', () => {
    it('should insert text at given path without marks', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>first</htext>
            </hp>
            <hp>
              <htext>second</htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>first</htext>
          </hp>
          <hp>
            <htext>second inserted</htext>
          </hp>
        </editor>
      ) as any;

      input.marks = { bold: true };
      input.tf.insertText(' inserted', {
        at: {
          offset: 6,
          path: [1, 0],
        },
      });

      expect(input.children).toEqual(output.children);
    });
  });
});
