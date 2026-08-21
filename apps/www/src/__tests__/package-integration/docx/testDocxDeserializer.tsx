/** @jsx jsx */

import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  HeadingPlugin,
  ItalicPlugin,
  ScriptPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
  HorizontalRulePlugin,
} from '@platejs/basic-nodes/react';
import {
  TextAlignPlugin,
  TextIndentPlugin,
  LineHeightPlugin,
} from '@platejs/basic-styles/react';
import { CodeBlockPlugin } from '@platejs/code-block/react';
import { DocxPastePlugin } from '@platejs/docx-paste';
import { IndentPlugin } from '@platejs/indent/react';
import { JuicePlugin } from '@platejs/juice';
import { LinkPlugin } from '@platejs/link/react';
import { BaseListPlugin } from '@platejs/list';
import { ImagePlugin } from '@platejs/media/react';
import { TablePlugin } from '@platejs/table/react';
import { jsx } from '@platejs/test-utils';
import { BaseParagraphPlugin } from 'platejs';

import { createBaseEditor } from '../../../../../../packages/core/src/lib/editor';
import { readTestFile } from './readTestFile';

jsx;

const targetPluginConfig = {
  targetPlugins: [BaseParagraphPlugin, HeadingPlugin, HeadingPlugin],
};

export const createClipboardData = (html: string, rtf?: string): DataTransfer =>
  ({
    files: [],
    getData: (format: string) => (format === 'text/html' ? html : rtf) ?? '',
    items: [],
    types: rtf ? ['text/html', 'text/rtf'] : ['text/html'],
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
        HeadingPlugin,

        BoldPlugin,
        CodePlugin,
        ItalicPlugin,
        StrikethroughPlugin,
        ScriptPlugin,
        UnderlinePlugin,
        TablePlugin,
        LineHeightPlugin.configure(targetPluginConfig),
        TextAlignPlugin.configure(targetPluginConfig),
        TextIndentPlugin.configure(targetPluginConfig),
        IndentPlugin.configure(targetPluginConfig),
        BaseListPlugin.configure(targetPluginConfig),
        JuicePlugin,
        DocxPastePlugin,
      ],
      selection: input.selection,
      initialValue: input.children,
    } as any);

    actual.api.dom.clipboard.insertData(
      createClipboardData(readTestFile(`./${filename}.html`))
    );

    expect(actual.read.children()).toEqual(expected.children);
  });
};
