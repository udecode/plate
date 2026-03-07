/** @jsx jsxt */

import { BaseImagePlugin } from '@platejs/media';
import { jsxt } from '@platejs/test-utils';
import { type SlateEditor, KEYS, createSlateEditor } from 'platejs';

import { BaseListPlugin } from '../BaseListPlugin';
import { toggleList } from './toggleList';

jsxt;

const runToggleList = (
  input: SlateEditor,
  plugins: any[] = [BaseListPlugin],
  type: string = KEYS.ulClassic
) => {
  const editor = createSlateEditor({
    plugins,
    selection: input.selection,
    value: input.children,
  });

  toggleList(editor, {
    type: editor.getType(type),
  });

  return editor;
};

describe('toggleList', () => {
  describe('turning paragraphs into lists', () => {
    it('wraps a collapsed paragraph in a bulleted list', () => {
      const input = (
        <editor>
          <hp>
            1<cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = runToggleList(input);

      expect(editor.children).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <hlic>1</hlic>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });

    it('preserves block order across a multi-block range selection', () => {
      const input = (
        <editor>
          <hp>
            <anchor />
            AAA
          </hp>
          <hp>BBB</hp>
          <hp>CCC</hp>
          <hp>
            DDD
            <focus />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = runToggleList(input);

      expect(editor.children).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <hlic>AAA</hlic>
              </hli>
              <hli>
                <hlic>BBB</hlic>
              </hli>
              <hli>
                <hlic>CCC</hlic>
              </hli>
              <hli>
                <hlic>DDD</hlic>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });

    it('keeps validLiChildrenTypes at the list item root', () => {
      const input = (
        <editor>
          <himg>
            <htext>
              <cursor />
            </htext>
          </himg>
        </editor>
      ) as any as SlateEditor;

      const editor = runToggleList(input, [
        BaseListPlugin.configure({
          options: {
            validLiChildrenTypes: [BaseImagePlugin.key],
          },
        }),
      ]);

      expect(editor.children).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <himg>
                  <htext />
                </himg>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });
  });

  describe('turning lists off', () => {
    it('unwraps a selected list range into paragraphs', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                <anchor />1
              </hlic>
            </hli>
            <hli>
              <hlic>2</hlic>
            </hli>
            <hli>
              <hlic>
                3<focus />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const editor = runToggleList(input);

      expect(editor.children).toEqual(
        (
          <editor>
            <hp>1</hp>
            <hp>2</hp>
            <hp>3</hp>
          </editor>
        ).children
      );
    });

    it('splits a list around the current item when toggled from inside the list', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
            </hli>
            <hli>
              <hlic>
                2
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>3</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const editor = runToggleList(input);

      expect(editor.children).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <hlic>1</hlic>
              </hli>
            </hul>
            <hp>2</hp>
            <hul>
              <hli>
                <hlic>3</hlic>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });
  });

  describe('switching list types', () => {
    it('switches only the targeted nested list when the selection is inside it', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>1</hlic>
              <hul>
                <hli>
                  <hlic>
                    11
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const editor = runToggleList(input, [BaseListPlugin], KEYS.olClassic);

      expect(editor.children).toEqual(
        (
          <editor>
            <hul>
              <hli>
                <hlic>1</hlic>
                <hol>
                  <hli>
                    <hlic>11</hlic>
                  </hli>
                </hol>
              </hli>
            </hul>
          </editor>
        ).children
      );
    });

    it('retypes the full selected range when the selection spans list content and paragraphs', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>
                <anchor />1
              </hlic>
              <hul>
                <hli>
                  <hlic>11</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
          <hp>
            body
            <focus />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const editor = runToggleList(input, [BaseListPlugin], KEYS.olClassic);

      expect(editor.children).toEqual(
        (
          <editor>
            <hol>
              <hli>
                <hlic>1</hlic>
                <hol>
                  <hli>
                    <hlic>11</hlic>
                  </hli>
                </hol>
              </hli>
              <hli>
                <hlic>body</hlic>
              </hli>
            </hol>
          </editor>
        ).children
      );
    });
  });
});
