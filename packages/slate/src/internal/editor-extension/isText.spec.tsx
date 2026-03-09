/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('isText', () => {
  const editor = createEditor(
    (
      <editor>
        <hp>test</hp>
      </editor>
    ) as any
  );

  describe('when element path', () => {
    it('returns false', () => {
      const path = [0];
      expect(editor.api.isText(path)).toBe(false);
    });
  });

  describe('when text path', () => {
    it('returns true', () => {
      const path = [0, 0];
      expect(editor.api.isText(path)).toBe(true);
    });
  });
});
