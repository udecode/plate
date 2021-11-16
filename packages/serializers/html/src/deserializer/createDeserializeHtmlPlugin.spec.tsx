/** @jsx jsx */
import { PlateEditor, PlatePlugin } from '@udecode/plate-core';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { createHeadingPlugin } from '../../../../elements/heading/src/createHeadingPlugin';
import { createLinkPlugin } from '../../../../elements/link/src/createLinkPlugin';
import { createMediaEmbedPlugin } from '../../../../elements/media-embed/src/createMediaEmbedPlugin';
import { createBoldPlugin } from '../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createPlateUIEditor } from '../../../../plate/src/utils/createPlateUIEditor';
import { createDeserializeHtmlPlugin } from './createDeserializeHtmlPlugin';

jsx;

describe('when inserting html', () => {
  // noinspection CheckTagEmptyBody
  const data = {
    getData: () => '<html><body><h1>inserted</h1></body></html>',
  };

  const makeDataTransfer = (value: string): DataTransfer => {
    return {
      getData: () => value,
    } as any;
  };

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

      const plugins: PlatePlugin[] = [
        createHeadingPlugin(),
        createDeserializeHtmlPlugin(),
      ];

      const editor = createPlateUIEditor({
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

      const plugins: PlatePlugin[] = [
        createHeadingPlugin(),
        createDeserializeHtmlPlugin(),
      ];

      const editor = createPlateUIEditor({
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

    const plugins: PlatePlugin[] = [
      createParagraphPlugin(),
      createDeserializeHtmlPlugin(),
    ];

    const editor = createPlateUIEditor({
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

describe('when inserting empty html', () => {
  const input = ((
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any) as PlateEditor;

  // noinspection CheckTagEmptyBody
  const data = {
    getData: () => '<html></html>',
  };

  const output = (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any;

  it('should do nothing', () => {
    const plugins: PlatePlugin[] = [
      createBoldPlugin(),
      createDeserializeHtmlPlugin(),
    ];

    const editor = createPlateUIEditor({
      editor: input,
      plugins,
    });

    editor.insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when inserting an iframe without src', () => {
  const input = ((
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any) as PlateEditor;

  // noinspection CheckTagEmptyBody
  const data = {
    getData: () => '<html><body><iframe>inserted</iframe></body></html>',
  };

  const output = (
    <editor>
      <hp>
        testinserted
        <cursor />
      </hp>
    </editor>
  ) as any;

  it('should do nothing', () => {
    const plugins: PlatePlugin[] = [
      createMediaEmbedPlugin(),
      createDeserializeHtmlPlugin(),
    ];

    const editor = createPlateUIEditor({
      editor: input,
      plugins,
    });

    editor.insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when inserting link with href', () => {
  const input = ((
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any) as PlateEditor;

  // noinspection CheckTagEmptyBody
  const data = {
    getData: () =>
      `<html><body><a href="http://test.com">link</a></body></html>`,
  };

  const output = (
    <editor>
      <hp>
        test
        <ha url="http://test.com">link</ha>
        <cursor />
      </hp>
    </editor>
  ) as any;

  it('should insert the link with url', () => {
    const plugins: PlatePlugin[] = [
      createParagraphPlugin(),
      createLinkPlugin(),
      createDeserializeHtmlPlugin(),
    ];

    const editor = createPlateUIEditor({
      editor: input,
      plugins,
    });

    editor.insertData(data as any);

    expect(editor.children).toEqual(output.children);
  });
});

describe('when inserting plain text', () => {
  const input = ((
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any) as PlateEditor;

  const data = {
    getData: (format: string) => (format === 'text/html' ? '' : 'inserted'),
  };

  const output = (
    <editor>
      <hp>
        testinserted
        <cursor />
      </hp>
    </editor>
  ) as any;

  it('should run default insert', () => {
    jest.spyOn(JSON, 'parse').mockReturnValue(<fragment>inserted</fragment>);

    const editor = createPlateUIEditor({
      editor: input,
      plugins: [createDeserializeHtmlPlugin()],
    });

    editor.insertData(data as any);

    expect(input.children).toEqual(output.children);
  });
});
