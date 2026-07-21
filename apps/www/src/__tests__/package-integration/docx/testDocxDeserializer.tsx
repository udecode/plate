/** @jsx jsx */

import { TextAlignPlugin } from '@platejs/basic-styles/react';
import { TextIndentPlugin } from '@platejs/basic-styles/react';
import { BasicBlocksPlugin } from '@platejs/basic-nodes/react';
import { BasicMarksPlugin } from '@platejs/basic-nodes/react';
import { HorizontalRulePlugin } from '@platejs/basic-nodes/react';
import { CodeBlockPlugin } from '@platejs/code-block/react';
import { IndentPlugin } from '@platejs/indent/react';
import { JuicePlugin } from '@platejs/juice';
import { LineHeightPlugin } from '@platejs/basic-styles/react';
import { LinkPlugin } from '@platejs/link/react';
import { BaseListPlugin } from '@platejs/list';
import { ImagePlugin } from '@platejs/media/react';
import { TablePlugin } from '@platejs/table/react';
import { jsx } from '@platejs/test-utils';

import { DocxPlugin } from '@platejs/docx';
import { readTestFile } from './readTestFile';
import { createBaseEditor } from '../../../../../../packages/core/src/lib/editor';
import type { BasePlugin } from '../../../../../../packages/core/src/lib/plugin';

// biome-ignore lint/suspicious/noUnusedExpressions: test
jsx;

const targetPluginConfig = {
  options: {
    targetPluginKeys: ['p', 'h1', 'h2', 'h3'],
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
  overridePlugins?: BasePlugin['override']['plugins'];
  plugins?: any[];
}) => {
  it('deserialize', () => {
    const actual = createBaseEditor({
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
        LineHeightPlugin.configure(targetPluginConfig),
        TextAlignPlugin.configure(targetPluginConfig),
        TextIndentPlugin.configure(targetPluginConfig),
        IndentPlugin.configure(targetPluginConfig),
        BaseListPlugin.configure(targetPluginConfig),
        DocxPlugin,
        JuicePlugin,
      ],
      selection: input.selection,
      value: input.children,
    } as any);

    actual.api.clipboard.insertData(
      createClipboardData(readTestFile(`./${filename}.html`))
    );

    expect(actual.read.children()).toEqual(expected.children);
  });
};
