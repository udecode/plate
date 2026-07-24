/** @jsx jsx */

import { TextAlignPlugin } from '@platejs/basic-styles/react';
import { TextIndentPlugin } from '@platejs/basic-styles/react';
import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  H5Plugin,
  H6Plugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
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
import { BaseParagraphPlugin } from 'platejs';

import { DocxPlugin } from '@platejs/docx';
import { readTestFile } from './readTestFile';
import { createBaseEditor } from '../../../../../../packages/core/src/lib/editor';

// biome-ignore lint/suspicious/noUnusedExpressions: test
jsx;

const targetPluginConfig = {
  targetPluginKeys: [
    BaseParagraphPlugin.key,
    H1Plugin.key,
    H2Plugin.key,
    H3Plugin.key,
  ],
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
  plugins = [],
}: {
  expected: any;
  filename: string;
  input?: any;
  plugins?: any[];
}) => {
  it('deserialize', () => {
    const actual = createBaseEditor({
      plugins: [
        ...plugins,
        ImagePlugin,
        HorizontalRulePlugin,
        CodeBlockPlugin,
        LinkPlugin,
        BlockquotePlugin,
        H1Plugin,
        H2Plugin,
        H3Plugin,
        H4Plugin,
        H5Plugin,
        H6Plugin,
        BoldPlugin,
        CodePlugin,
        ItalicPlugin,
        StrikethroughPlugin,
        SubscriptPlugin,
        SuperscriptPlugin,
        UnderlinePlugin,
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
      initialValue: input.children,
    } as any);

    actual.api.clipboard.insertData(
      createClipboardData(readTestFile(`./${filename}.html`))
    );

    expect(actual.read.children()).toEqual(expected.children);
  });
};
