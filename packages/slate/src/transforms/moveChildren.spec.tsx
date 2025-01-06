/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';
import { Path } from 'slate';

import { createEditor } from '../createEditor';
import { moveChildren } from './moveChildren';

jsxt;

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

it('should be', () => {
  const atPath = input.api.find({ match: { id: '2' } })?.[1];
  const toPath = input.api.find({ match: { id: '12' } })?.[1];

  const moved =
    atPath &&
    toPath &&
    moveChildren(input, { at: atPath, to: Path.next(toPath) });

  expect(input.children).toEqual(output.children);
  expect(moved).toBe(2);
});
