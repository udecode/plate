/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { createEditorPlugins } from '../../../slate-plugins/src/utils/createEditorPlugins';
import { createLinkPlugin } from '../../link/src/createLinkPlugin';
import { createParagraphPlugin } from '../../paragraph/src/createParagraphPlugin';
import { createListPlugin } from './createListPlugin';

jsx;

const testInsertText = (input: any, expected: any) => {
  const editor = createEditorPlugins({
    editor: input,
    plugins: [createParagraphPlugin(), createListPlugin(), createLinkPlugin()],
  });

  editor.insertText('o');

  expect(editor.children).toEqual(expected.children);
};

const testDeleteBackward = (input: any, expected: any) => {
  const editor = createEditorPlugins({
    editor: input,
    plugins: [createParagraphPlugin(), createListPlugin()],
  });

  editor.deleteBackward('character');

  expect(editor.children).toEqual(expected.children);
};

describe('withList', () => {
  describe('normalizeList', () => {
    describe('when there is no lic in li', () => {
      it('should insert lic', () => {
        const input = ((
          <editor>
            <hul>
              <hli>
                hell
                <cursor /> <ha>link</ha>
                <htext />
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        const expected = ((
          <editor>
            <hul>
              <hli>
                <hlic>
                  hello <ha>link</ha>
                  <htext />
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        testInsertText(input, expected);
      });
    });

    describe('when li > p > children', () => {
      it('should be li > lic > children', () => {
        const input = ((
          <editor>
            <hul>
              <hli>
                <hp>
                  hell
                  <cursor />
                </hp>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        const expected = ((
          <editor>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        testInsertText(input, expected);
      });
    });

    describe('when li > lic > p > children', () => {
      it('should be li > lic > children', () => {
        const input = ((
          <editor>
            <hul>
              <hli>
                <hlic>
                  <hp>
                    hell
                    <cursor />
                  </hp>
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        const expected = ((
          <editor>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        testInsertText(input, expected);
      });
    });

    describe('when li > lic > block > block > children', () => {
      it('should be li > lic > children', () => {
        const input = ((
          <editor>
            <hul>
              <hli>
                <hlic>
                  <element>
                    <hp>
                      hell
                      <cursor />
                    </hp>
                  </element>
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        const expected = ((
          <editor>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        testInsertText(input, expected);
      });
    });

    describe('when li > lic > many block > block > children', () => {
      it('should be li > lic > children merged', () => {
        const input = ((
          <editor>
            <hul>
              <hli>
                <hlic>
                  <element>
                    <hp>
                      hell
                      <cursor />
                    </hp>
                  </element>
                  <element>
                    <hp> world</hp>
                  </element>
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        const expected = ((
          <editor>
            <hul>
              <hli>
                <hlic>hello world</hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        testInsertText(input, expected);
      });
    });
  });

  describe('when deleteBackward at block start', () => {
    describe('when at first li', () => {
      it('should be unindent li children and unwrap the list', () => {
        const input = ((
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>
                  <cursor />
                  hello
                </hlic>
                <hul>
                  <hli>
                    <hlic>world</hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        const expected = ((
          <editor>
            <hp>test</hp>
            <hp>hello</hp>
            <hul>
              <hli>
                <hlic>world</hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        testDeleteBackward(input, expected);
      });
    });

    describe('when at nested li without li children', () => {
      it('should delete the li and merge the text nodes to the previous li', () => {
        const input = ((
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>hello</hlic>
                <hul>
                  <hli>
                    <hlic>
                      <cursor />
                      world
                    </hlic>
                  </hli>
                </hul>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        const expected = ((
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>helloworld</hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        testDeleteBackward(input, expected);
      });
    });

    describe('when the list is not nested and li is not the first child', () => {
      it('should move li up', () => {
        const input = ((
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
              <hli>
                <hlic>
                  <cursor />
                  world
                </hlic>
              </hli>
            </hul>
          </editor>
        ) as any) as Editor;

        const expected = ((
          <editor>
            <hp>test</hp>
            <hul>
              <hli>
                <hlic>hello</hlic>
              </hli>
            </hul>
            <hp>world</hp>
          </editor>
        ) as any) as Editor;

        testDeleteBackward(input, expected);
      });
    });
  });
});
