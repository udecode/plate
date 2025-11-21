/** @jsx jsxt */
import { describe, expect, test as it } from 'bun:test';

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('getParentNode', () => {
  describe('when not root path', () => {
    it('should return parent with empty path', () => {
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

      expect(editor.api.parent([0])?.[1]).toEqual([]);
    });
  });

  describe('when root path', () => {
    it('should return undefined', () => {
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

      expect(editor.api.parent([])).toEqual(undefined);
    });
  });
});
