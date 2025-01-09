/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('setNodes', () => {
  describe('when setting marks', () => {
    it('should set marks with marks option', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              te
              <anchor />
              st
              <focus />
              ing
            </hp>
          </editor>
        ) as any
      );

      editor.tf.setNodes({ bold: true }, { marks: true });

      expect(editor.children).toEqual([
        {
          children: [
            { text: 'te' },
            { bold: true, text: 'st' },
            { text: 'ing' },
          ],
          type: 'p',
        },
      ]);
    });
  });
});
