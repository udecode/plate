/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

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
    it('should return false', () => {
      const path = [0];
      expect(editor.api.isText(path)).toBe(false);
    });
  });

  describe('when text path', () => {
    it('should return true', () => {
      const path = [0, 0];
      expect(editor.api.isText(path)).toBe(true);
    });
  });
});
