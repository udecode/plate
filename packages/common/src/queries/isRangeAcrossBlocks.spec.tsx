/** @jsx jsx */

import { SPEditor } from '@udecode/plate-core';
import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { createEditorPlugins } from '../../../plate/src/utils/createEditorPlugins';
import { isRangeAcrossBlocks } from './isRangeAcrossBlocks';

jsx;

describe('when selection is in the same block', () => {
  describe('when one text', () => {
    it('should be false', () => {
      const input = ((
        <editor>
          <hp>
            Secundus, <anchor />
            velox lubas superbe anhelare <focus />
            de noster , lotus acipenser.
          </hp>
        </editor>
      ) as any) as SPEditor;

      const editor = createEditorPlugins({
        editor: input,
      });

      expect(isRangeAcrossBlocks(editor)).toEqual(false);
    });
  });

  describe('when focus is inline element', () => {
    it('should be false', () => {
      const input = ((
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
      ) as any) as SPEditor;

      const editor = createEditorPlugins({
        editor: input,
        plugins: [createLinkPlugin()],
      });

      expect(isRangeAcrossBlocks(editor)).toEqual(false);
    });
  });
});
