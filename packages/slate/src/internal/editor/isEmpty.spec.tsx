/** @jsx jsxt */

import { createPlateEditor } from '@udecode/plate-core/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { jsxt } from '@udecode/plate-test-utils';

import type { Editor, LegacyEditorMethods } from '../../interfaces';

import { createEditor } from '../../create-editor';

jsxt;

describe('isEmpty', () => {
  describe('when no target (editor)', () => {
    it('should be true when editor has one empty element', () => {
      const editor = createEditor(
        (
          <editor>
            <hp />
          </editor>
        ) as any
      );

      expect(editor.api.isEmpty()).toBe(true);
    });

    it('should be false when editor has multiple elements', () => {
      const editor = createEditor(
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
      const editor = createEditor(
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
      const editor = createEditor(
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
        const editor = createEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>test</ha>
              </hp>
            </editor>
          ) as any
        ) as Editor & LegacyEditorMethods;

        editor.isInline = (element) => element.type === 'a';

        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          true
        );
      });
    });

    describe('when cursor not at end', () => {
      it('should be false', () => {
        const editor = createEditor(
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
        ) as Editor & LegacyEditorMethods;

        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          false
        );
      });
    });

    describe('when empty text after', () => {
      it('should be true', () => {
        const editor = createEditor(
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
        ) as Editor & LegacyEditorMethods;

        editor.isInline = (element) => element.type === 'a';

        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          true
        );
      });
    });

    describe('when no text after', () => {
      it('should be true', () => {
        const input = createEditor(
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
        ) as Editor & LegacyEditorMethods;

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
        const input = createEditor(
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
        ) as Editor & LegacyEditorMethods;

        const editor = createPlateEditor({
          editor: input as any,
          plugins: [LinkPlugin],
        });

        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          false
        );
      });
    });

    describe('when multiple siblings after cursor', () => {
      it('should be false when any sibling has text', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  test
                  <cursor />
                </ha>
                <htext />
                <ha>not empty</ha>
                <htext>also not empty</htext>
              </hp>
            </editor>
          ) as any
        ) as Editor & LegacyEditorMethods;

        editor.isInline = (element) => element.type === 'a';
        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          false
        );
      });

      it('should be true when all siblings are empty', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  test
                  <cursor />
                </ha>
                <htext />
                <ha />
                <htext />
              </hp>
            </editor>
          ) as any
        ) as Editor & LegacyEditorMethods;

        editor.isInline = (element) => element.type === 'a';
        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          true
        );
      });
    });

    describe('when cursor is at different positions', () => {
      it('should handle cursor at start of node', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  <cursor />
                  test
                </ha>
              </hp>
            </editor>
          ) as any
        ) as Editor & LegacyEditorMethods;

        editor.isInline = (element) => element.type === 'a';
        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          false
        );
      });

      it('should handle cursor at middle of node', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                <htext>first</htext>
                <ha>
                  te
                  <cursor />
                  st
                </ha>
              </hp>
            </editor>
          ) as any
        ) as Editor & LegacyEditorMethods;

        editor.isInline = (element) => element.type === 'a';
        expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(
          false
        );
      });
    });
  });

  describe('when block=true', () => {
    it('should check if block above is empty', () => {
      const editor = createEditor(
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
