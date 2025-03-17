/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';
import { PathApi } from '../../interfaces';

jsxt;

describe('moveNodes', () => {
  describe('when moving children', () => {
    it('should move all children to target path', () => {
      const input = createEditor(
        (
          <editor>
            <hul>
              <hli>
                <hp>11</hp>
              </hli>
              <hli id="12">
                <hp>12</hp>
              </hli>
            </hul>
            <hul id="2">
              <hli>
                <hp>21</hp>
              </hli>
              <hli>
                <hp>22</hp>
              </hli>
            </hul>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hul>
            <hli>
              <hp>11</hp>
            </hli>
            <hli id="12">
              <hp>12</hp>
            </hli>
            <hli>
              <hp>21</hp>
            </hli>
            <hli>
              <hp>22</hp>
            </hli>
          </hul>
          <hul id="2">
            <htext />
          </hul>
        </editor>
      ) as any;

      const at = input.api.node({ id: '2', at: [] })![1];
      const to = PathApi.next(input.api.node({ id: '12', at: [] })![1]);

      const moved = input.tf.moveNodes({
        at,
        children: true,
        to,
      });

      expect(input.children).toEqual(output.children);
      expect(moved).toBe(true);
    });

    it('should move children from specified index', () => {
      const input = createEditor(
        (
          <editor>
            <hul>
              <hli>
                <hp>11</hp>
              </hli>
              <hli id="12">
                <hp>12</hp>
              </hli>
            </hul>
            <hul id="2">
              <hli>
                <hp>21</hp>
              </hli>
              <hli>
                <hp>22</hp>
              </hli>
              <hli>
                <hp>23</hp>
              </hli>
            </hul>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hul>
            <hli>
              <hp>11</hp>
            </hli>
            <hli id="12">
              <hp>12</hp>
            </hli>
            <hli>
              <hp>22</hp>
            </hli>
            <hli>
              <hp>23</hp>
            </hli>
          </hul>
          <hul id="2">
            <hli>
              <hp>21</hp>
            </hli>
          </hul>
        </editor>
      ) as any;

      const at = input.api.node({ id: '2', at: [] })![1];
      const to = PathApi.next(input.api.node({ id: '12', at: [] })![1]);

      const moved = input.tf.moveNodes({
        at,
        children: true,
        fromIndex: 1,
        to,
      });

      expect(input.children).toEqual(output.children);
      expect(moved).toBe(true);
    });

    it('should move children matching condition', () => {
      const input = createEditor(
        (
          <editor>
            <hul>
              <hli>
                <hp>11</hp>
              </hli>
              <hli id="12">
                <hp>12</hp>
              </hli>
            </hul>
            <hul id="2">
              <hli id="move">
                <hp>21</hp>
              </hli>
              <hli>
                <hp>22</hp>
              </hli>
              <hli id="move">
                <hp>23</hp>
              </hli>
            </hul>
          </editor>
        ) as any
      );

      const output = (
        <editor>
          <hul>
            <hli>
              <hp>11</hp>
            </hli>
            <hli id="12">
              <hp>12</hp>
            </hli>
            <hli id="move">
              <hp>21</hp>
            </hli>
            <hli id="move">
              <hp>23</hp>
            </hli>
          </hul>
          <hul id="2">
            <hli>
              <hp>22</hp>
            </hli>
          </hul>
        </editor>
      ) as any;

      const at = input.api.node({ id: '2', at: [] })![1];
      const to = PathApi.next(input.api.node({ id: '12', at: [] })![1]);

      const moved = input.tf.moveNodes({
        at,
        children: true,
        to,
        match: (node) => 'id' in node && node.id === 'move',
      });

      expect(input.children).toEqual(output.children);
      expect(moved).toBe(true);
    });

    it('should do nothing if not a block node', () => {
      const input = createEditor(
        (
          <editor>
            <hp>
              <htext>test</htext>
            </hp>
          </editor>
        ) as any
      );

      const moved = input.tf.moveNodes({
        at: [0, 0],
        children: true,
        to: [0],
      });

      expect(moved).toBe(false);
      expect(input.children).toEqual([
        { children: [{ text: 'test' }], type: 'p' },
      ]);
    });
  });
});
