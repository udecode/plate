/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('hasMark', () => {
  describe('when mark is active', () => {
    it('returns true', () => {
      const editor = createEditor(
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
    it('returns false', () => {
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

      expect(editor.api.hasMark('bold')).toBe(false);
    });
  });
});
