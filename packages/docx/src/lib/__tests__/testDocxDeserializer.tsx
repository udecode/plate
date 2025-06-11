/** @jsx jsx */

import { type SlatePlugin, createSlateEditor } from '@udecode/plate';
import { TextAlignPlugin } from '@udecode/plate-basic-styles/react';
import { BasicBlocksPlugin } from '@udecode/plate-basic-nodes/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-nodes/react';
import { HorizontalRulePlugin } from '@udecode/plate-basic-nodes/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { LineHeightPlugin } from '@udecode/plate-basic-styles/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ImagePlugin } from '@udecode/plate-media/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { jsx } from '@udecode/plate-test-utils';

import { DocxPlugin } from '../DocxPlugin';
import { readTestFile } from './readTestFile';

jsx;

const injectConfig = {
  inject: {
    targetPlugins: ['p', 'h1', 'h2', 'h3'],
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
      override: {
        plugins: overridePlugins,
      },
      plugins: [
        ...plugins,
        ImagePlugin,
        HorizontalRulePlugin,
        CodeBlockPlugin,
        LinkPlugin,
        BasicBlocksPlugin,
        BasicMarksPlugin,
        TablePlugin,
        LineHeightPlugin.extend(() => injectConfig),
        TextAlignPlugin.extend(() => injectConfig),
        IndentPlugin.extend(() => injectConfig),
        DocxPlugin,
        JuicePlugin,
      ],
      selection: input.selection,
      value: input.children,
    });

    actual.tf.insertData(
      createClipboardData(readTestFile(`../__tests__/${filename}.html`))
    );

    expect(actual.children).toEqual(expected.children);
  });
};
