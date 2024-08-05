/** @jsx jsx */

import { AlignPlugin } from '@udecode/plate-alignment';
import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks';
import {
  type OverrideByKey,
  createPlateEditor,
} from '@udecode/plate-common/server';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate-heading';
import { createHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createLineHeightPlugin } from '@udecode/plate-line-height';
import { LinkPlugin } from '@udecode/plate-link';
import { ImagePlugin } from '@udecode/plate-media';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { TablePlugin } from '@udecode/plate-table';
import { jsx } from '@udecode/plate-test-utils';
import { alignPlugin } from 'www/src/lib/plate/demo/plugins/alignPlugin';
import { lineHeightPlugin } from 'www/src/lib/plate/demo/plugins/lineHeightPlugin';

import { readTestFile } from '../../__tests__/readTestFile';
import { createDeserializeDocxPlugin } from '../DeserializeDocxPlugin';

jsx;

export const createClipboardData = (html: string, rtf?: string): DataTransfer =>
  ({
    getData: (format: string) => (format === 'text/html' ? html : rtf),
  }) as any;

export const getDocxTestName = (name: string) => `when pasting docx ${name}`;

export const testDocxDeserializer = ({
  expected,
  filename,
  input = (
    <editor>
      <hp>
        <cursor />
      </hp>
    </editor>
  ),
  overrideByKey,
  plugins = [],
}: {
  expected: any;
  filename: string;
  input?: any;
  overrideByKey?: OverrideByKey;
  plugins?: PlatePluginList;
}) => {
  it('should deserialize', () => {
    const actual = createPlateEditor({
      editor: input,
      overrideByKey,
      plugins: [
        ...plugins,
        ImagePlugin,
        createHorizontalRulePlugin(),
        LinkPlugin,
        TablePlugin,
        BasicElementsPlugin,
        BasicMarksPlugin,
        TablePlugin,
        createLineHeightPlugin(lineHeightPlugin as any),
        AlignPlugin.extend(alignPlugin as any),
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
    });

    actual.insertData(
      createClipboardData(
        readTestFile(`../deserializer/__tests__/${filename}.html`)
      )
    );

    expect(actual.children).toEqual(expected.children);
  });
};
