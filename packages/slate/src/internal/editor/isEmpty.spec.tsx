/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createEditor } from '../../create-editor';
import type { Editor, LegacyEditorMethods } from '../../interfaces';

jsxt;

describe('isEmpty', () => {
  describe('when no target (editor)', () => {
    it('returns true when the editor has one empty element', () => {
      const editor = createEditor(
        (
          <editor>
            <hp />
          </editor>
        ) as any
      );

      expect(editor.api.isEmpty()).toBe(true);
    });

    it('returns false when the editor has multiple elements', () => {
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
    it('returns true when the editor has one empty element', () => {
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
    it('get block above and check if empty', () => {
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

  describe('when target is a node', () => {
    it('returns false for a void block target', () => {
      const editor = createEditor({
        children: [
          {
            children: [{ text: '' }],
            type: 'tag',
            void: true,
          },
        ] as any,
      }) as Editor & LegacyEditorMethods;

      editor.isVoid = (element) => element.type === 'tag';

      expect(editor.api.isEmpty(editor.children[0] as any)).toBe(false);
    });

    it('returns false for a non-empty inline target', () => {
      const editor = createEditor({
        children: [
          {
            children: [
              { text: 'one' },
              { children: [{ text: 'two' }], type: 'a' },
              { text: 'three' },
            ],
            type: 'p',
          },
        ] as any,
      }) as Editor & LegacyEditorMethods;

      editor.isInline = (element) => element.type === 'a';

      expect(editor.api.isEmpty(editor.children[0].children[1] as any)).toBe(
        false
      );
    });
  });

  describe('when after=true', () => {
    describe('when no selection', () => {
      it('returns true', () => {
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
      it('returns false', () => {
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
      it('returns true', () => {
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

    describe('when multiple siblings after cursor', () => {
      it('returns false when any sibling has text', () => {
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

      it('returns true when all siblings are empty', () => {
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
      it('handle cursor at start of node', () => {
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

      it('handle cursor at middle of node', () => {
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

    it('returns true when the cursor is already at the end of the block', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              test
              <cursor />
            </hp>
          </editor>
        ) as any
      ) as Editor & LegacyEditorMethods;

      expect(editor.api.isEmpty(editor.selection, { after: true })).toBe(true);
    });
  });

  describe('when block=true', () => {
    it('check if block above is empty', () => {
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

  describe('when target is a location', () => {
    it('returns false when any matched node is not empty', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              <anchor />
              text
              <focus />
            </hp>
          </editor>
        ) as any
      );

      expect(editor.api.isEmpty(editor.selection)).toBe(false);
    });
  });
});
