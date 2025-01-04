/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../createTEditor';
import { isTextByPath } from './isTextByPath';

jsxt;

describe('isTextByPath', () => {
  const editor = createTEditor(
    (
      <editor>
        <hp>test</hp>
      </editor>
    ) as any
  );

  describe('when element path', () => {
    it('should return false', () => {
      const path = [0];
      expect(isTextByPath(editor, path)).toBe(false);
    });
  });

  describe('when text path', () => {
    it('should return true', () => {
      const path = [0, 0];
      expect(isTextByPath(editor, path)).toBe(true);
    });
  });
});
