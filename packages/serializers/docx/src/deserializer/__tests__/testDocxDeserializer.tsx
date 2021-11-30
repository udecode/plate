/** @jsx jsx */
import {
  createPlateEditor,
  OverrideByKey,
  PlatePlugin,
} from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createIndentPlugin } from '../../../../../blocks/indent/src/createIndentPlugin';
import { createBasicElementsPlugin } from '../../../../../elements/basic-elements/src/createBasicElementPlugins';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
} from '../../../../../elements/heading/src/constants';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createTablePlugin } from '../../../../../elements/table/src/createTablePlugin';
import { createBasicMarksPlugin } from '../../../../../marks/basic-marks/src/createBasicMarksPlugin';
import { createJuicePlugin } from '../../../../juice/src/createJuicePlugin';
import { readTestFile } from '../../__tests__/readTestFile';
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
  plugins = [],
  filename,
  overrideByKey,
}: {
  input?: any;
  expected: any;
  plugins?: PlatePlugin[];
  filename: string;
  overrideByKey?: OverrideByKey;
}) => {
  it('should deserialize', () => {
    const actual = createPlateEditor({
      editor: input,
      plugins: [
        ...plugins,
        createIndentPlugin({
          inject: {
            props: {
              validTypes: [
                ELEMENT_PARAGRAPH,
                ELEMENT_H1,
                ELEMENT_H2,
                ELEMENT_H3,
              ],
            },
          },
        }),
        createBasicElementsPlugin(),
        createBasicMarksPlugin(),
        createTablePlugin(),
        createDeserializeDocxPlugin(),
        createJuicePlugin(),
      ],
      overrideByKey,
    });

    actual.insertData(
      createClipboardData(
        readTestFile(`../deserializer/__tests__/${filename}.html`)
      )
    );

    expect(actual.children).toEqual(expected.children);
  });
};
