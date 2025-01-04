/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../createTEditor';
import { isMarkActive } from './isMarkActive';

jsxt;

describe('isMarkActive', () => {
  describe('when mark is active', () => {
    it('should return true', () => {
      const editor = createTEditor(
        (
          <editor>
            <hp>
              tes
              <htext bold>t</htext>
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(isMarkActive(editor, 'bold')).toBe(true);
    });
  });

  describe('when mark is not active', () => {
    it('should return false', () => {
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

      expect(isMarkActive(editor, 'bold')).toBe(false);
    });
  });
});
