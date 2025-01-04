/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../createTEditor';
import { getRangeBefore } from './getRangeBefore';

jsxt;

describe('before', () => {
  describe('default', () => {
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

    const output = {
      anchor: {
        offset: 3,
        path: [0, 0],
      },
      focus: {
        offset: 4,
        path: [0, 0],
      },
    };

    it('should be', () => {
      expect(getRangeBefore(input, input.selection as any)).toEqual(output);
    });
  });

  describe('undefined', () => {
    const input = createTEditor(
      (
        <editor>
          <hp>
            <cursor />
            test
          </hp>
        </editor>
      ) as any
    );

    const output = undefined;

    it('should be', () => {
      expect(getRangeBefore(input, input.selection as any)).toEqual(output);
    });
  });
});
