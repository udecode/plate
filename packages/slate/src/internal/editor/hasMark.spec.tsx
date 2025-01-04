/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../createTEditor';

jsxt;

describe('hasMark', () => {
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

      expect(editor.api.hasMark('bold')).toBe(true);
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

      expect(editor.api.hasMark('bold')).toBe(false);
    });
  });
});
