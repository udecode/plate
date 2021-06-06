/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { createEditorPlugins } from '../../../slate-plugins/src/utils/createEditorPlugins';
import { createLinkPlugin } from '../../link/src/createLinkPlugin';
import { createParagraphPlugin } from '../../paragraph/src/createParagraphPlugin';
import { createListPlugin } from './createListPlugin';

jsx;

describe('normalizeList', () => {
  describe('when there is no p in li', () => {
    it('should insert a p', () => {
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

      const editor = createEditorPlugins({
        editor: input,
        plugins: [
          createParagraphPlugin(),
          createListPlugin(),
          createLinkPlugin(),
        ],
      });

      editor.insertText('o');

      expect(editor.children).toEqual(expected.children);
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

      const editor = createEditorPlugins({
        editor: input,
        plugins: [createParagraphPlugin(), createListPlugin()],
      });

      editor.insertText('o');

      expect(editor.children).toEqual(expected.children);
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

      const editor = createEditorPlugins({
        editor: input,
        plugins: [createParagraphPlugin(), createListPlugin()],
      });

      editor.insertText('o');

      expect(editor.children).toEqual(expected.children);
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

      const editor = createEditorPlugins({
        editor: input,
        plugins: [createParagraphPlugin(), createListPlugin()],
      });

      editor.insertText('o');

      expect(editor.children).toEqual(expected.children);
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
                  <hp>
                    world
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
              <hlic>hello world</hlic>
            </hli>
          </hul>
        </editor>
      ) as any) as Editor;

      const editor = createEditorPlugins({
        editor: input,
        plugins: [createParagraphPlugin(), createListPlugin()],
      });

      editor.insertText('o');

      expect(editor.children).toEqual(expected.children);
    });
  });
});
