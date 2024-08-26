/** @jsx jsx */

import { AlignPlugin } from '@udecode/plate-alignment';
import { BasicElementsPlugin } from '@udecode/plate-basic-elements';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks';
import {
  type SlatePlugin,
  type SlatePlugins,
  createSlateEditor,
} from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { IndentPlugin } from '@udecode/plate-indent';
import { JuicePlugin } from '@udecode/plate-juice';
import { LineHeightPlugin } from '@udecode/plate-line-height';
import { LinkPlugin } from '@udecode/plate-link';
import { ImagePlugin } from '@udecode/plate-media';
import { TablePlugin } from '@udecode/plate-table';
import { jsx } from '@udecode/plate-test-utils';

import { DocxPlugin } from '../DocxPlugin';
import { readTestFile } from './readTestFile';

jsx;

const injectConfig = {
  inject: {
    targetPlugins: [
      ParagraphPlugin.key,
      HEADING_KEYS.h1,
      HEADING_KEYS.h2,
      HEADING_KEYS.h3,
    ],
  },
};

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
  overridePlugins,
  plugins = [],
}: {
  expected: any;
  filename: string;
  input?: any;
  overridePlugins?: SlatePlugin['override']['plugins'];
  plugins?: SlatePlugins;
}) => {
  it('should deserialize', () => {
    const actual = createSlateEditor({
      editor: input,
      override: {
        plugins: overridePlugins,
      },
      plugins: [
        ...plugins,
        ImagePlugin,
        HorizontalRulePlugin,
        LinkPlugin,
        BasicElementsPlugin,
        BasicMarksPlugin,
        TablePlugin,
        LineHeightPlugin.extend(() => injectConfig),
        AlignPlugin.extend(() => injectConfig),
        IndentPlugin.extend(() => injectConfig),
        DocxPlugin,
        JuicePlugin,
      ],
    });

    actual.insertData(
      createClipboardData(readTestFile(`../__tests__/${filename}.html`))
    );

    expect(actual.children).toEqual(expected.children);
  });
};
