/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { getNode } from '../../../interfaces';

jsxt;

describe('getNode', () => {
  const input = createTEditor(
    (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  describe('when path exists', () => {
    it('should return the node', () => {
      expect(getNode(input, [0])).toBeDefined();
    });
  });

  describe('when path does not exist', () => {
    it('should return null', () => {
      expect(getNode(input, [0, 0, 0])).toBeNull();
    });
  });
});
