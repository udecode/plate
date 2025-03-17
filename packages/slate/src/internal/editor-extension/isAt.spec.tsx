/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createEditor } from '../../create-editor';
import {
  type Editor,
  type LegacyEditorMethods,
  RangeApi,
} from '../../interfaces/index';

jsxt;

describe('isAt', () => {
  describe('when checking range position', () => {
    describe('when checking text', () => {
      it('should be true when range is in single text node', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                text <anchor />
                here
                <focus /> now
              </hp>
            </editor>
          ) as any
        );

        expect(input.api.isAt({ text: true })).toBe(true);
      });

      it('should be false when range spans multiple text nodes', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                <anchor />
                text
                <htext>here</htext>
                <focus />
              </hp>
            </editor>
          ) as any
        );

        expect(input.api.isAt({ text: true })).toBe(false);
      });
    });

    describe('when checking blocks', () => {
      describe('when selection is in the same block', () => {
        describe('when one text', () => {
          it('should be false for blocks check', () => {
            const input = createEditor(
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

            expect(input.api.isAt({ blocks: true })).toBe(false);
          });

          it('should be true for block check', () => {
            const input = createEditor(
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

            expect(input.api.isAt({ block: true })).toBe(true);
          });
        });

        describe('when focus is inline element', () => {
          it('should be false for blocks check', () => {
            const input = createEditor(
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
            ) as Editor & LegacyEditorMethods;

            input.isInline = (element) => element.type === 'a';

            expect(input.api.isAt({ blocks: true })).toBe(false);
          });
        });
      });

      describe('when selection spans multiple blocks', () => {
        it('should be true for blocks check', () => {
          const input = createEditor(
            (
              <editor>
                <hp>
                  first <anchor />
                  text
                </hp>
                <hp>
                  second <focus />
                  text
                </hp>
              </editor>
            ) as any
          );

          expect(input.api.isAt({ blocks: true })).toBe(true);
        });

        it('should be false for block check', () => {
          const input = createEditor(
            (
              <editor>
                <hp>
                  first <anchor />
                  text
                </hp>
                <hp>
                  second <focus />
                  text
                </hp>
              </editor>
            ) as any
          );

          expect(input.api.isAt({ block: true })).toBe(false);
        });
      });
    });

    describe('when checking block boundaries', () => {
      it('should be true when range starts at block start', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                <anchor />
                text
                <focus /> here
              </hp>
            </editor>
          ) as any
        );

        expect(input.api.isAt({ start: true })).toBe(true);
      });

      it('should be true when range ends at block end', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                text <anchor />
                here
                <focus />
              </hp>
            </editor>
          ) as any
        );

        expect(input.api.isAt({ end: true })).toBe(true);
      });

      it('should be true when range covers entire block', () => {
        const input = createEditor(
          (
            <editor>
              <hp>
                <anchor />
                text here
                <focus />
              </hp>
            </editor>
          ) as any
        );

        expect(input.api.isAt({ block: true, end: true, start: true })).toBe(
          true
        );
      });
    });
  });

  describe('when checking point position', () => {
    describe('when checking word end', () => {
      it('should be true when at word end', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                word
                <cursor />
                {' another'}
              </hp>
            </editor>
          ) as any
        );

        const point = RangeApi.start(editor.selection!);
        expect(editor.api.isAt({ at: point, end: true, word: true })).toBe(
          true
        );
      });

      it('should be false when not at word end', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                wo
                <cursor />
                rd
              </hp>
            </editor>
          ) as any
        );

        const point = RangeApi.start(editor.selection!);
        expect(editor.api.isAt({ at: point, end: true, word: true })).toBe(
          false
        );
      });

      it('should be true at end of text', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                word
                <cursor />
              </hp>
            </editor>
          ) as any
        );

        const point = RangeApi.start(editor.selection!);
        expect(editor.api.isAt({ at: point, end: true, word: true })).toBe(
          true
        );
      });
    });
  });
});
