/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../createTEditor';

jsxt;

describe('getParentNode', () => {
  describe('when not root path', () => {
    it('should return parent with empty path', () => {
      const editor = createTEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(editor.api.parent([0])?.[1]).toEqual([]);
    });
  });

  describe('when root path', () => {
    it('should return undefined', () => {
      const editor = createTEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(editor.api.parent([])).toEqual(undefined);
    });
  });
});
