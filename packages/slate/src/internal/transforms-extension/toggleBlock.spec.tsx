/** @jsx jsxt */

import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { createPlateEditor } from '@udecode/plate-core/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('when wrap=false', () => {
  describe('active', () => {
    const input = createEditor(
      (
        <editor>
          <hblockquote>
            test
            <cursor />
          </hblockquote>
        </editor>
      ) as any
    );

    const output = createEditor(
      (
        <editor>
          <hdefault>
            test
            <cursor />
          </hdefault>
        </editor>
      ) as any
    );

    it('should toggle block type', () => {
      const editor = createPlateEditor({ editor: input });
      editor.tf.toggleBlock('blockquote', { defaultType: 'p' });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('inactive', () => {
    const input = createEditor(
      (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    const output = createEditor(
      (
        <editor>
          <hblockquote>
            test
            <cursor />
          </hblockquote>
        </editor>
      ) as any
    );

    it('should toggle block type', () => {
      const editor = createPlateEditor({ editor: input });
      editor.tf.toggleBlock(BlockquotePlugin.key);

      expect(editor.children).toEqual(output.children);
    });
  });
});

describe('when wrap=true', () => {
  describe('active', () => {
    const input = createEditor(
      (
        <editor>
          <hcodeblock>
            <hp>
              test
              <cursor />
            </hp>
          </hcodeblock>
        </editor>
      ) as any
    );

    const output = createEditor(
      (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    it('should unwrap block', () => {
      const editor = createPlateEditor({ editor: input });
      editor.tf.toggleBlock('code_block', { wrap: true });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('inactive', () => {
    const input = createEditor(
      (
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    const output = createEditor(
      (
        <editor>
          <hcodeblock>
            <hp>
              test
              <cursor />
            </hp>
          </hcodeblock>
        </editor>
      ) as any
    );

    it('should wrap block', () => {
      const editor = createPlateEditor({ editor: input });
      editor.tf.toggleBlock('code_block', { wrap: true });

      expect(editor.children).toEqual(output.children);
    });
  });
});
