/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('replaceNodes', () => {
  describe('when replacing node', () => {
    it('should replace node at path', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              <htext>test</htext>
            </hp>
            <element>
              <htext>old</htext>
            </element>
          </editor>
        ) as any
      );

      editor.tf.replaceNodes(
        { children: [{ text: 'new' }], type: 'p' },
        { at: [1] }
      );

      expect(editor.children).toEqual([
        {
          children: [{ text: 'test' }],
          type: 'p',
        },
        {
          children: [{ text: 'new' }],
          type: 'p',
        },
      ]);
    });
  });

  describe('when replacing children', () => {
    it('should replace children at path', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              <htext>test</htext>
            </hp>
            <element>
              <hp>one</hp>
              <hp>two</hp>
            </element>
          </editor>
        ) as any
      );

      editor.tf.replaceNodes(
        [
          { children: [{ text: 'new' }], type: 'p' },
          { children: [{ text: 'nodes' }], type: 'p' },
        ],
        {
          at: [1],
          children: true,
        }
      );

      expect(editor.children).toEqual([
        {
          children: [{ text: 'test' }],
          type: 'p',
        },
        {
          children: [
            {
              children: [{ text: 'new' }],
              type: 'p',
            },
            {
              children: [{ text: 'nodes' }],
              type: 'p',
            },
          ],
        },
      ]);
    });

    it('should handle undefined at', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>test</hp>
          </editor>
        ) as any
      );

      editor.tf.replaceNodes(
        { children: [{ text: 'new' }], type: 'p' },
        { children: true }
      );

      // Should not modify the document
      expect(editor.children).toEqual([
        {
          children: [{ text: 'test' }],
          type: 'p',
        },
      ]);
    });
  });
});
