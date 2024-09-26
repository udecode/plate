/** @jsx jsx */

import { AlignPlugin } from '@udecode/plate-alignment/react';
import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { type SlatePlugin, createSlateEditor } from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ImagePlugin } from '@udecode/plate-media/react';
import { TablePlugin } from '@udecode/plate-table/react';
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
  plugins?: any[];
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
