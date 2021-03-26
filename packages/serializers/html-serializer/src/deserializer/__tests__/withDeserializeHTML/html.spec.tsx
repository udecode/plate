/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { getHeadingPlugin } from '../../../../../../elements/heading/src/getHeadingPlugin';
import { createEditorPlugins } from '../../../../../../slate-plugins/src/utils/createEditorPlugins';
import { getDeserializeHTMLPlugin } from '../../getDeserializeHTMLPlugin';

jsx;

// noinspection CheckTagEmptyBody
const data = {
  getData: () => '<html><body><h1>inserted</h1></body></html>',
};

describe('when inserting html', () => {
  describe('when inserting h1 inside p (not empty)', () => {
    it('should just insert h1 text inside p', () => {
      const input = ((
        <editor>
          <hp>
            test
            <cursor />
          </hp>
        </editor>
      ) as any) as Editor;

      const expected = (
        <editor>
          <hp>
            testinserted
            <cursor />
          </hp>
        </editor>
      ) as any;

      const plugins = [getHeadingPlugin()];
      plugins.push(getDeserializeHTMLPlugin({ plugins }));
      const editor = createEditorPlugins({
        editor: input,
        plugins,
      });

      editor.insertData(data as any);

      expect(editor.children).toEqual(expected.children);
    });
  });

  describe('when inserting h1 inside an empty p', () => {
    it('should set p type to h1 and insert h1 text', () => {
      const input = ((
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any) as Editor;

      const expected = (
        <editor>
          <hh1>
            inserted
            <cursor />
          </hh1>
        </editor>
      ) as any;

      const plugins = [getHeadingPlugin()];
      plugins.push(getDeserializeHTMLPlugin({ plugins }));
      const editor = createEditorPlugins({
        editor: input,
        plugins,
      });

      editor.insertData(data as any);

      expect(editor.children).toEqual(expected.children);
    });
  });
});
