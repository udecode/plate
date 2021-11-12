/** @jsx jsx */
import { PlateEditor, PlatePlugin } from '@udecode/plate-core';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { createHeadingPlugins } from '../../../../../../elements/heading/src/createHeadingPlugins';
import { createEditorPlugins } from '../../../../../../plate/src/utils/createEditorPlugins';
import { createDeserializeHtmlPlugin } from '../../createDeserializeHtmlPlugin';

jsx;

// noinspection CheckTagEmptyBody
const data = {
  getData: () => '<html><body><h1>inserted</h1></body></html>',
};

const makeDataTransfer = (value: string): DataTransfer => {
  return {
    getData: () => value,
  } as any;
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
      ) as any) as PlateEditor;

      const expected = (
        <editor>
          <hp>
            testinserted
            <cursor />
          </hp>
        </editor>
      ) as any;

      const plugins: PlatePlugin[] = [createHeadingPlugins()];
      plugins.push(createDeserializeHtmlPlugin({ plugins }));
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
      ) as any) as PlateEditor;

      const expected = (
        <editor>
          <hh1>
            inserted
            <cursor />
          </hh1>
        </editor>
      ) as any;

      const plugins: PlatePlugin[] = [createHeadingPlugins()];
      plugins.push(createDeserializeHtmlPlugin({ plugins }));
      const editor = createEditorPlugins({
        editor: input,
        plugins,
      });

      editor.insertData(data as any);

      expect(editor.children).toEqual(expected.children);
    });
  });

  describe('when inserting a text node surrounded by elements', () => {
    const input = ((
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any) as PlateEditor;

    const expected = (
      <editor>
        <hp>first element</hp>
        <hp>second element</hp>
        <hp>
          text node in the end
          <cursor />
        </hp>
      </editor>
    ) as any;

    const plugins: PlatePlugin[] = [createParagraphPlugin()];

    plugins.push(createDeserializeHtmlPlugin({ plugins }));

    const editor = createEditorPlugins({
      editor: input,
      plugins,
    });

    editor.insertData(
      makeDataTransfer(
        '<html><body><p>first element</p><p>second element</p>text node in the end</body></html>'
      )
    );

    expect(editor.children).toEqual(expected.children);
  });
});
