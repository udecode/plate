/** @jsx jsx */

import { type SlatePlugin, createSlateEditor } from 'platejs';
import { TextAlignPlugin } from '@platejs/basic-styles/react';
import { BasicBlocksPlugin } from '@platejs/basic-nodes/react';
import { BasicMarksPlugin } from '@platejs/basic-nodes/react';
import { HorizontalRulePlugin } from '@platejs/basic-nodes/react';
import { CodeBlockPlugin } from '@platejs/code-block/react';
import { IndentPlugin } from '@platejs/indent/react';
import { JuicePlugin } from '@platejs/juice';
import { LineHeightPlugin } from '@platejs/basic-styles/react';
import { LinkPlugin } from '@platejs/link/react';
import { ImagePlugin } from '@platejs/media/react';
import { TablePlugin } from '@platejs/table/react';
import { jsx } from '@platejs/test-utils';

import { DocxPlugin } from '../DocxPlugin';
import { readTestFile } from './readTestFile';

// biome-ignore lint/nursery/noUnusedExpressions: test
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
