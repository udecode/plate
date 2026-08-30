/** @jsx jsxt */

import { jsxt } from '@platejs/test';
import {
  BaseListPlugin,
  BaseParagraphPlugin,
  createEditor,
  type BasePluginInput,
  type Editor,
} from 'platejs';
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
  LineHeightPlugin,
  IndentPlugin,
  LinkPlugin,
} from 'platejs/react';
import { TablePlugin } from 'platejs/table/react';

jsxt;

const targetPluginConfig = {
  targetPlugins: [BaseParagraphPlugin, HeadingPlugin, HeadingPlugin],
};

const basicNodePlugins = [
  BlockquotePlugin,
  HeadingPlugin,

  HorizontalRulePlugin,
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  ScriptPlugin,
  UnderlinePlugin,
] as const;

const listTestPlugins: BasePluginInput[] = [
  ImagePlugin,
  HorizontalRulePlugin,
  LinkPlugin,
  TablePlugin,
  ...basicNodePlugins,
  LineHeightPlugin.configure(targetPluginConfig),
  TextAlignPlugin.configure(targetPluginConfig),
  IndentPlugin.configure(targetPluginConfig),
  BaseListPlugin.configure(targetPluginConfig),
  JuicePlugin,
  DocxPastePlugin,
];

const createClipboardData = (html: string, rtf?: string): DataTransfer =>
  ({
    files: [],
    getData: (format: string) => (format === 'text/html' ? html : rtf) ?? '',
    items: [],
    types: rtf ? ['text/html', 'text/rtf'] : ['text/html'],
  }) as any;

const insertData = (editor: Pick<Editor, 'api'>, data: DataTransfer) => {
  editor.api.dom.clipboard.insertData(data);
};

describe('when insertData disc and decimal from gdocs', () => {
  it('handle Google Docs nested lists', () => {
    const e = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any;
    const editor = createEditor({
      plugins: listTestPlugins,
      selection: e.selection,
      initialValue: e.children,
    });

    insertData(
      editor,
      createClipboardData(
        `<b style="font-weight:normal;" id="docs-internal-guid-4f8ed8e9-7fff-b83b-9190-aa89959d7b6d"><ul style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:disc;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">A</span></p></li><ul style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:disc;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="2"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">B</span></p></li></ul></ul><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:decimal;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">A</span></p></li><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:lower-alpha;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="2"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">B</span></p></li><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:decimal;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;margin-left: 36pt;" aria-level="4"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">c</span></p></li></ol></ol></ol></b>`
      )
    );

    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            text: 'A',
          },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'B',
          },
        ],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'A',
          },
        ],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'B',
          },
        ],
        indent: 2,
        listStyle: 'lower-alpha',
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'c',
          },
        ],
        indent: 4,
        listType: 'numbered',
        type: 'paragraph',
      },
    ]);
  });
});

describe('when insertData with nested ul inside li', () => {
  it('handle li with nested ul correctly', () => {
    const e = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any;
    const editor = createEditor({
      plugins: listTestPlugins,
      selection: e.selection,
      initialValue: e.children,
    });

    insertData(
      editor,
      createClipboardData(
        `<ul>
          <li>Item 1
            <ul>
              <li>Item 1.1
                <ul>
                  <li>Item 1.1.1</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>Item 2</li>
        </ul>`
      )
    );

    expect(editor.read.children()).toEqual([
      {
        children: [
          {
            // Note: trailing space from HTML
            text: 'Item 1 ',
          },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [
          {
            // Note: trailing space from HTML
            text: 'Item 1.1 ',
          },
        ],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'Item 1.1.1',
          },
        ],
        indent: 3,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [
          {
            text: 'Item 2',
          },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
  });
});
