/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('removeNodes', () => {
  describe('when previousEmptyBlock is true', () => {
    it('remove the previous empty block', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext />
            </hp>
            <hp>
              <htext>text</htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>text</htext>
          </hp>
        </editor>
      ) as any;

      input.tf.removeNodes({ at: [1], previousEmptyBlock: true });

      expect(input.children).toEqual(output.children);
    });

    it('keeps the previous block when it is not empty', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>not empty</htext>
            </hp>
            <hp>
              <htext>text</htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>not empty</htext>
          </hp>
          <hp>
            <htext>text</htext>
          </hp>
        </editor>
      ) as any;

      input.tf.removeNodes({ at: [1], previousEmptyBlock: true });

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when previousEmptyBlock is false', () => {
    it('remove nodes at specified path', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>text</htext>
            </hp>
            <hp>
              <htext>remove me</htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>text</htext>
          </hp>
        </editor>
      ) as any;

      input.tf.removeNodes({ at: [1] });

      expect(input.children).toEqual(output.children);
    });

    it('keeps nodes unchanged if no path is specified', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>text</htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>text</htext>
          </hp>
        </editor>
      ) as any;

      input.tf.removeNodes({ previousEmptyBlock: false });

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when children option is true', () => {
    it('remove all children at specified path', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>text</htext>
            </hp>
            <hul>
              <hli>
                <hp>item 1</hp>
              </hli>
              <hli>
                <hp>item 2</hp>
              </hli>
              <hli>
                <hp>item 3</hp>
              </hli>
            </hul>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>text</htext>
          </hp>
          <hul>
            <htext />
          </hul>
        </editor>
      ) as any;

      input.tf.removeNodes({ at: [1], children: true });

      expect(input.children).toEqual(output.children);
    });

    it('keeps nodes unchanged if the path has no children', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>text</htext>
            </hp>
            <hp>
              <htext>another</htext>
            </hp>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>text</htext>
          </hp>
          <hp>
            <htext>another</htext>
          </hp>
        </editor>
      ) as any;

      input.tf.removeNodes({ at: [0, 0], children: true });

      expect(input.children).toEqual(output.children);
    });

    it('remove nested children in reverse order', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>text</htext>
            </hp>
            <hul>
              <hli>
                <hp>item 1</hp>
                <hul>
                  <hli>
                    <hp>nested 1</hp>
                  </hli>
                  <hli>
                    <hp>nested 2</hp>
                  </hli>
                </hul>
              </hli>
              <hli>
                <hp>item 2</hp>
              </hli>
            </hul>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>text</htext>
          </hp>
          <hul>
            <htext />
          </hul>
        </editor>
      ) as any;

      input.tf.removeNodes({ at: [1], children: true });

      expect(input.children).toEqual(output.children);
    });

    it('keeps nodes unchanged if children removal has no path', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>text</htext>
            </hp>
            <hul>
              <hli>
                <hp>item 1</hp>
              </hli>
            </hul>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hp>
            <htext>text</htext>
          </hp>
          <hul>
            <hli>
              <hp>item 1</hp>
            </hli>
          </hul>
        </editor>
      ) as any;

      input.tf.removeNodes({ children: true });

      expect(input.children).toEqual(output.children);
    });
  });
});
