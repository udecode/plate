/** @jsx jsx */
import { createAlignPlugin } from '@udecode/plate-alignment';
import {
  createPlateEditor,
  OverrideByKey,
  PlatePlugin,
} from '@udecode/plate-common';
import { createLinkPlugin } from '@udecode/plate-link';
import { createImagePlugin } from '@udecode/plate-media';
import { jsx } from '@udecode/plate-test-utils';
import { alignPlugin } from 'examples/src/align/alignPlugin';
import { lineHeightPlugin } from 'examples/src/line-height/lineHeightPlugin';
import { createBasicElementsPlugin } from '../../../../../nodes/basic-elements/src/createBasicElementsPlugin';
import { createBasicMarksPlugin } from '../../../../../nodes/basic-marks/src/createBasicMarksPlugin';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
} from '../../../../../nodes/heading/src/constants';
import { createHorizontalRulePlugin } from '../../../../../nodes/horizontal-rule/src/createHorizontalRulePlugin';
import { createIndentPlugin } from '../../../../../nodes/indent/src/createIndentPlugin';
import { createLineHeightPlugin } from '../../../../../nodes/line-height/src/createLineHeightPlugin';
import { ELEMENT_PARAGRAPH } from '../../../../../nodes/paragraph/src/createParagraphPlugin';
import { createTablePlugin } from '../../../../../nodes/table/src/createTablePlugin';
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
        createImagePlugin(),
        createHorizontalRulePlugin(),
        createLinkPlugin(),
        createTablePlugin(),
        createBasicElementsPlugin(),
        createBasicMarksPlugin(),
        createTablePlugin(),
        createLineHeightPlugin(lineHeightPlugin as any),
        createAlignPlugin(alignPlugin as any),
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
