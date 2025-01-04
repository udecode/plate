/** @jsx jsxt */

import { createPlateEditor } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../createTEditor';

jsxt;

describe('isElementEmpty', () => {
  describe('when afterSelection=true', () => {
    describe('when no selection', () => {
      it('should be false', () => {
        const editor = createTEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>test</ha>
              </hp>
            </editor>
          ) as any
        );

        editor.isInline = (element) => element.type === 'a';

        expect(editor.api.isEmpty(null, { afterSelection: true })).toBe(false);
      });
    });

    describe('when cursor not at end', () => {
      it('should be false', () => {
        const editor = createTEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  tes
                  <cursor />t
                </ha>
                <htext />
              </hp>
            </editor>
          ) as any
        );

        expect(editor.api.isEmpty(null, { afterSelection: true })).toBe(false);
      });
    });

    describe('when empty text after', () => {
      it('should be true', () => {
        const editor = createTEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  test
                  <cursor />
                </ha>
                <htext />
              </hp>
            </editor>
          ) as any
        );

        editor.isInline = (element) => element.type === 'a';

        expect(editor.api.isEmpty(null, { afterSelection: true })).toBe(true);
      });
    });

    describe('when no text after', () => {
      it('should be true', () => {
        const input = createTEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  test
                  <cursor />
                </ha>
              </hp>
            </editor>
          ) as any
        );

        const editor = createPlateEditor({
          editor: input as any,
          plugins: [LinkPlugin],
        });

        expect(editor.api.isEmpty(null, { afterSelection: true })).toBe(true);
      });
    });

    describe('when text after', () => {
      it('should be false', () => {
        const input = createTEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  test
                  <cursor />
                </ha>
                last
              </hp>
            </editor>
          ) as any
        );

        const editor = createPlateEditor({
          editor: input as any,
          plugins: [LinkPlugin],
        });

        expect(editor.api.isEmpty(null, { afterSelection: true })).toBe(false);
      });
    });
  });
});
