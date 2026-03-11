/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

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
      it('returns true when the range is in a single text node', () => {
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

      it('returns false when the range spans multiple text nodes', () => {
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
          it('returns false for a blocks check', () => {
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

          it('returns true for a block check', () => {
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
          it('returns false for a blocks check', () => {
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
        it('returns true for a blocks check', () => {
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

        it('returns false for a block check', () => {
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
      it('returns true when the range starts at the block start', () => {
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

      it('returns true when the range ends at the block end', () => {
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

      it('returns true when the range covers the entire block', () => {
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
    describe('when checking block boundaries', () => {
      it('returns true at the start of a block', () => {
        const editor = createEditor(
          (
            <editor>
              <hp>
                <cursor />
                word
              </hp>
            </editor>
          ) as any
        );

        const point = RangeApi.start(editor.selection!);

        expect(editor.api.isAt({ at: point, start: true })).toBe(true);
      });

      it('returns false when the point is not at the start of a block', () => {
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

        expect(editor.api.isAt({ at: point, start: true })).toBe(false);
      });

      it('returns true at the end of a block', () => {
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

        expect(editor.api.isAt({ at: point, end: true })).toBe(true);
      });
    });

    describe('when checking word end', () => {
      it('returns true at a word end', () => {
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

      it('returns false when not at a word end', () => {
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

      it('returns true at the end of the text', () => {
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

    it('returns false for a point when no position flag is provided', () => {
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

      expect(editor.api.isAt({ at: editor.selection!.anchor })).toBe(false);
    });
  });

  it('returns false for a range when no position flag is provided', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            wo
            <anchor />
            rd
            <focus />
          </hp>
        </editor>
      ) as any
    );

    expect(editor.api.isAt({ at: editor.selection! })).toBe(false);
  });
});
