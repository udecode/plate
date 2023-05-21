/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { isRangeAcrossBlocks } from './isRangeAcrossBlocks';

jsx;

describe('when selection is in the same block', () => {
  describe('when one text', () => {
    it('should be false', () => {
      const input = (
        <editor>
          <hp>
            Secundus, <anchor />
            velox lubas superbe anhelare <focus />
            de noster , lotus acipenser.
          </hp>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateUIEditor({
        editor: input,
      });

      expect(isRangeAcrossBlocks(editor)).toEqual(false);
    });
  });

  describe('when focus is inline element', () => {
    it('should be false', () => {
      const input = (
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
      ) as any as PlateEditor;

      const editor = createPlateUIEditor({
        editor: input,
        plugins: [createLinkPlugin()],
      });

      expect(isRangeAcrossBlocks(editor)).toEqual(false);
    });
  });
});
