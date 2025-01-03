/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../createTEditor';
import { isRangeAcrossBlocks } from './isRangeAcrossBlocks';

jsxt;

describe('when selection is in the same block', () => {
  describe('when one text', () => {
    it('should be false', () => {
      const input = createTEditor(
        (
          <editor>
            <hp>
              Secundus, <anchor />
              velox lubas superbe anhelare <focus />
              de noster , lotus acipenser.
            </hp>
          </editor>
        ) as any
      );

      expect(isRangeAcrossBlocks(input)).toEqual(false);
    });
  });

  describe('when focus is inline element', () => {
    it('should be false', () => {
      const input = createTEditor(
        (
          <editor>
            <hp>
              Secundus, <anchor />
              velox lubas superbe{' '}
              <ha>
                anhelare <focus />
                de noster
              </ha>
              , lotus acipenser.
            </hp>
          </editor>
        ) as any
      );

      input.isInline = (element) => element.type === 'a';

      expect(isRangeAcrossBlocks(input)).toEqual(false);
    });
  });
});