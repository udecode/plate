/** @jsx jsxt */

import {
  type SlateEditor,
  type TDescendant,
  createSlateEditor,
} from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';

import { ListPlugin } from '../react';

jsxt;

const editorTest = (input: any, fragment: any, expected: any) => {
  const editor = createSlateEditor({
    editor: input,
    plugins: [ListPlugin],
  });

  editor.insertFragment(fragment);

  expect(editor.children).toEqual(expected.children);
};

describe('when pasting ul > 2 li fragment', () => {
  describe('when selection in li', () => {
    it('should insert lis next to the lowest li', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    two
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>two</hlic>
                </hli>
                <hli>
                  <hlic>three</hlic>
                </hli>
                <hli>
                  <hlic>four</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert nested lis next to the lowest li, without the leading empty lis', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    two
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>two</hlic>
                </hli>
                <hli>
                  <hlic>three</hlic>
                  <hul>
                    <hli>
                      <hlic>five</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert nested lis with selected lic being an empty node and with nested lis', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    <cursor />
                  </hlic>
                  <hul>
                    <hli>
                      <hlic>two</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>three</hlic>
                  <hul>
                    <hli>
                      <hlic>five</hlic>
                    </hli>
                    <hli>
                      <hlic>two</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert nested lis with selected lic being an empty node', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>three</hlic>
                  <hul>
                    <hli>
                      <hlic>five</hlic>
                    </hli>
                  </hul>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert lis with missing lics due to copying lis at different levels', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>
                    two
                    <cursor />
                  </hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
                <hli>
                  <hlic>six</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
              <hul>
                <hli>
                  <hlic>two</hlic>
                </hli>
                <hli>
                  <hlic>five</hlic>
                </hli>
                <hli>
                  <hlic>six</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert a single li as text', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                two
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                twothree
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert a paragraph and a list', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                two
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hp>three</hp>
          <hul>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>twothree</hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
            <hli>
              <hlic>
                five
                <cursor />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert multiple paragraphs', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                two
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hp>three</hp>
          <hp>four</hp>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>twothree</hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
            <hli>
              <hlic>
                five
                <cursor />
              </hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    // Auto-correct generates a Paragraph node (in Chromium)
    it('should insert autocorrect-inserted paragraph inside a list', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                two
                <cursor />
                four
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hp>three</hp>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>
                twothreefour
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert simple text inside a list with selection across multiple list items', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>twofour</hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
          <selection>
            <anchor offset={0} path={[0, 0, 0, 0]} />
            <focus offset={3} path={[0, 1, 0, 0]} />
          </selection>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hp>three</hp>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>
                threefour
                <cursor />
              </hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert nested lis with selected lic being an empty node after selection removed', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>two</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
          <selection>
            <anchor offset={0} path={[0, 0, 0, 0]} />
            <focus offset={3} path={[0, 1, 0, 0]} />
          </selection>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>four</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>four</hlic>
              <hul>
                <hli>
                  <hlic>five</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should insert nested lis with selection across multiple lics', () => {
      const input = (
        <editor>
          <hul>
            <hli>
              <hlic>onetwo</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
          <selection>
            <anchor offset={3} path={[0, 0, 0, 0]} />
            <focus offset={5} path={[0, 1, 0, 0]} />
          </selection>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>five</hlic>
            </hli>
            <hli>
              <hlic>six</hlic>
              <hul>
                <hli>
                  <hlic>seven</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>five</hlic>
            </hli>
            <hli>
              <hlic>six</hlic>
              <hul>
                <hli>
                  <hlic>seven</hlic>
                </hli>
              </hul>
            </hli>
            <hli>
              <hlic>four</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('when selection not in li', () => {
    it('should paste the list', () => {
      const input = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });

    it('should paste the list with multiple lis', () => {
      const input = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>two</hlic>
            </hli>
            <hli>
              <hlic>three</hlic>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });
  });

  describe('when pasted lis not contain lic', () => {
    it('should normalize li children', () => {
      const input = (
        <editor>
          <hp>
            P
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const fragment = (
        <fragment>
          <hul>
            <hli>
              <hp>one</hp>
            </hli>
            <hli>
              <hp>two</hp>
              <hul>
                <hli>
                  <hp>three</hp>
                </hli>
              </hul>
            </hli>
          </hul>
        </fragment>
      ) as any as TDescendant[];

      const expected = (
        <editor>
          <hp>
            P
            <cursor />
          </hp>
          <hul>
            <hli>
              <hlic>one</hlic>
            </hli>
            <hli>
              <hlic>two</hlic>
              <hul>
                <hli>
                  <hlic>three</hlic>
                </hli>
              </hul>
            </hli>
          </hul>
        </editor>
      ) as any as SlateEditor;

      editorTest(input, fragment, expected);
    });
  });
});
