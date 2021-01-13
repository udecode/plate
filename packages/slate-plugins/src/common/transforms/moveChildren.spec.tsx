/** @jsx jsx */

import { Editor, Path } from 'slate';
import { jsx } from '../../__test-utils__/jsx';
import { findNode } from '../queries/findNode';
import { moveChildren } from './moveChildren';

const input = ((
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
) as any) as Editor;

const output = ((
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
) as any) as Editor;

it('should be', () => {
  const atPath = findNode(input, { match: { id: '2' } })?.[1];
  const toPath = findNode(input, { match: { id: '12' } })?.[1];

  const moved =
    atPath &&
    toPath &&
    moveChildren(input, { at: atPath, to: Path.next(toPath) });

  expect(input.children).toEqual(output.children);
  expect(moved).toBe(2);
});
