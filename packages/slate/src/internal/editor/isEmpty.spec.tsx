/** @jsx jsxt */

import { createPlateEditor } from '@udecode/plate-common/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../createTEditor';

jsxt;

describe('isEmpty', () => {
  describe('when no target (editor)', () => {
    it('should be true when editor has one empty element', () => {
      const editor = createTEditor(
        (
          <editor>
            <hp />
          </editor>
        ) as any
      );

      expect(editor.api.isEmpty()).toBe(true);
    });

    it('should be false when editor has multiple elements', () => {
      const editor = createTEditor(
        (
          <editor>
            <hp>test</hp>
            <hp>test2</hp>
          </editor>
        ) as any
      );

      expect(editor.api.isEmpty()).toBe(false);
    });
  });

  describe('when target is editor', () => {
    it('should be true when editor has one empty element', () => {
      const editor = createTEditor(
        (
          <editor>
            <hp />
          </editor>
        ) as any
      );

      expect(editor.api.isEmpty(editor)).toBe(true);
    });
  });

  describe('when target is path', () => {
    it('should get block above and check if empty', () => {
      const editor = createTEditor(
        (
          <editor>
            <hp>
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(editor.api.isEmpty([0])).toBe(true);
    });
  });

  describe('when after=true', () => {
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

        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          true
        );
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

        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          false
        );
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

        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          true
        );
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

        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          true
        );
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

        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          false
        );
      });
    });
  });

  describe('when block=true', () => {
    it('should check if block above is empty', () => {
      const editor = createTEditor(
        (
          <editor>
            <hp>
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(editor.api.isEmpty(editor.selection, { block: true })).toBe(true);
    });
  });
});
