/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('removeNodes', () => {
  describe('when previousEmptyBlock is true', () => {
    it('should remove the previous empty block', () => {
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

    it('should do nothing if previous block is not empty', () => {
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
    it('should remove nodes at specified path', () => {
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

    it('should do nothing if no path is specified', () => {
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
    it('should remove all children at specified path', () => {
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

    it('should do nothing if path has no children', () => {
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

    it('should remove nested children in reverse order', () => {
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

    it('should do nothing if no path is specified with children option', () => {
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
