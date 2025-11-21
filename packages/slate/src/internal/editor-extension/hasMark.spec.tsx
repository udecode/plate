/** @jsx jsxt */
import { describe, expect, test as it } from 'bun:test';

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('hasMark', () => {
  describe('when mark is active', () => {
    it('should return true', () => {
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
    it('should return false', () => {
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
