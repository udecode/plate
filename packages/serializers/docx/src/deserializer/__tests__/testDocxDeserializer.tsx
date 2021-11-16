/** @jsx jsx */
import {
  createPlateEditor,
  OverridesByKey,
  PlatePlugin,
} from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { readTestFile } from '../../readTestFile';
import { createDeserializeDocxPlugin } from '../createDeserializeDocxPlugin';

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
  overrides,
}: {
  input?: any;
  expected: any;
  plugins: PlatePlugin[];
  filename: string;
  overrides?: OverridesByKey;
}) => {
  it('should deserialize', () => {
    const actual = createPlateEditor({
      editor: input,
      plugins: [...plugins, createDeserializeDocxPlugin({ plugins })],
      overrides,
    });

    actual.insertData(
      createClipboardData(
        readTestFile(`deserializer/__tests__/${filename}.html`)
      )
    );

    expect(actual.children).toEqual(expected.children);
  });
};
