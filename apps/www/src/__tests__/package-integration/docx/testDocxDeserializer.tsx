/** @jsx jsx */

import { jsx } from '@platejs/test';
import { BaseListPlugin, BaseParagraphPlugin, createEditor } from 'platejs';
import { DocxPastePlugin } from 'platejs/docx';
import { JuicePlugin } from 'platejs/juice';
import { ImagePlugin } from 'platejs/media/react';
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
  TextAlignPlugin,
  TextIndentPlugin,
  LineHeightPlugin,
  CodeBlockPlugin,
  IndentPlugin,
  LinkPlugin,
} from 'platejs/react';
import { TablePlugin } from 'platejs/table/react';

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
    const actual = createEditor({
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
