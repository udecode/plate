/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createEditor } from '../../create-editor';
import type { Editor, LegacyEditorMethods } from '../../interfaces';
import { syncLegacyMethods } from '../../utils';

jsxt;

describe('getPointBefore', () => {
  describe('default', () => {
    it('get point before cursor', () => {
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

      expect(
        editor.api.before(editor.selection as any, { skipInvalid: true })
      ).toEqual({
        offset: 3,
        path: [0, 0],
      });
    });

    it('returns undefined for an invalid location instead of throwing', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>test</hp>
          </editor>
        ) as any
      );

      expect(editor.api.before([9, 9, 9] as any)).toBeUndefined();
    });
  });

  describe('when afterMatch=true', () => {
    describe('when character match', () => {
      it('get point after matched character', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                test http://google.com
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        expect(
          editor.api.before(editor.selection as any, {
            afterMatch: true,
            matchString: ' ',
            skipInvalid: true,
          })
        ).toEqual({ offset: 5, path: [0, 0] });
      });
    });

    describe('when there is no space', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              http://google.com
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      it('returns start', () => {
        expect(
          editor.api.before(editor.selection!, {
            afterMatch: true,
            matchBlockStart: true,
            matchString: ' ',
            skipInvalid: true,
          })
        ).toEqual({
          offset: 0,
          path: [0, 0],
        });
      });
    });

    describe('when string match', () => {
      it('get point after matched string', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                find **test
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        expect(
          editor.api.before(editor.selection as any, {
            afterMatch: true,
            matchString: '**',
            skipInvalid: true,
          })
        ).toEqual({ offset: 7, path: [0, 0] });
      });
    });

    describe('when match function', () => {
      it('get point after match', () => {
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

        expect(
          editor.api.before(editor.selection as any, {
            afterMatch: true,
            unit: 'offset',
            match: () => true,
          })
        ).toEqual({ offset: 3, path: [0, 0] });
      });
    });
  });

  describe('when skipInvalid=true', () => {
    it('get point before space', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              test http://google.com
              <cursor />
            </hp>
          </editor>
        ) as any
      );

      expect(
        editor.api.before(editor.selection as any, {
          matchString: ' ',
          skipInvalid: true,
        })
      ).toEqual({ offset: 4, path: [0, 0] });
    });

    describe('when character not found', () => {
      it('returns undefined', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                test http://google.com
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        expect(
          editor.api.before(editor.selection as any, {
            matchString: '3',
            skipInvalid: false,
          })
        ).toBeUndefined();
      });
    });

    describe('when searching across blocks', () => {
      it('returns undefined if not found', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>find z</hp>
              <hp>
                test http://google.com
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        expect(
          editor.api.before(editor.selection as any, {
            matchString: 'z',
            skipInvalid: true,
          })
        ).toBeUndefined();
      });

      it('returns the block start when matchBlockStart is true', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>find z</hp>
              <hp>
                test http://google.com
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        expect(
          editor.api.before(editor.selection as any, {
            afterMatch: true,
            matchBlockStart: true,
            matchString: 'z',
            skipInvalid: true,
          })
        ).toEqual({
          offset: 0,
          path: [1, 0],
        });
      });
    });
  });

  describe('when unit=word', () => {
    it('get point before word', () => {
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

      expect(
        editor.api.before(editor.selection as any, {
          afterMatch: true,
          matchString: 'test',
          skipInvalid: true,
          unit: 'word',
        })
      ).toEqual({ offset: 4, path: [0, 0] });
    });
  });

  describe('when matchString', () => {
    describe('when multiple characters', () => {
      it('get point before matched string', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                find ***__
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        expect(
          editor.api.before(editor.selection as any, {
            matchString: '***__',
          })
        ).toEqual({ offset: 5, path: [0, 0] });
      });
    });

    describe('when array of strings', () => {
      it('get point before first matched string', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                find ***__
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        expect(
          editor.api.before(editor.selection as any, {
            matchString: ['/', '***__', '/'],
          })
        ).toEqual({ offset: 5, path: [0, 0] });
      });
    });
  });

  describe('when moving before void node', () => {
    it('get point before void node', () => {
      const editor = createEditor(
        (
          <editor>
            <hp>
              <htext />
              <himg>
                <htext />
                <cursor />
              </himg>
            </hp>
          </editor>
        ) as any
      ) as Editor & LegacyEditorMethods;
      const { isInline, isVoid } = editor;
      editor.isInline = (n) => n.type === 'img' || isInline(n);
      editor.isVoid = (n) => n.type === 'img' || isVoid(n);
      syncLegacyMethods(editor);

      expect(editor.api.before(editor.selection!.anchor)).toEqual({
        offset: 0,
        path: [0, 0],
      });
    });
  });
});
