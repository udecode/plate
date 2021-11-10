/** @jsx jsx */
import { PlatePlugin, PlatePluginOptions } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createEditorPlugins } from '../../../../../plate/src/utils/createEditorPlugins';
import { createDeserializeDocxPlugin } from '../createDeserializeDocxPlugin';
import { readTestFile } from './readTestFile';

jsx;

export const createClipboardData = (html: string, rtf?: string): DataTransfer =>
  ({
    getData: (format: string) => (format === 'text/html' ? html : rtf),
  } as any);

export const getDocxTestName = (name: string) => `when pasting docx ${name}`;

export const testDocxDeserializer = ({
  input = (
    <editor>
      <hp>
        <cursor />
      </hp>
    </editor>
  ),
  expected,
  plugins,
  filename,
  options,
}: {
  input?: any;
  expected: any;
  plugins: PlatePlugin[];
  filename: string;
  options?: Record<string, Partial<PlatePluginOptions>>;
}) => {
  it('should deserialize', () => {
    const actual = createEditorPlugins({
      editor: input,
      plugins: [...plugins, createDeserializeDocxPlugin({ plugins })],
      options,
    });

    actual.insertData(createClipboardData(readTestFile(`${filename}.html`)));

    expect(actual.children).toEqual(expected.children);
  });
};
