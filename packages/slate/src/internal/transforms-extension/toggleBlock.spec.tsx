/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('when wrap=false', () => {
  describe('active', () => {
    const editor = createEditor(
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
      editor.tf.toggleBlock('blockquote', { defaultType: 'p' });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('inactive', () => {
    const editor = createEditor(
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
      editor.tf.toggleBlock('blockquote');

      expect(editor.children).toEqual(output.children);
    });
  });
});

describe('when wrap=true', () => {
  describe('active', () => {
    const editor = createEditor(
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
      editor.tf.toggleBlock('code_block', { wrap: true });

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('inactive', () => {
    const editor = createEditor(
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
      editor.tf.toggleBlock('code_block', { wrap: true });

      expect(editor.children).toEqual(output.children);
    });
  });
});
