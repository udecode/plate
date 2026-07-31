/** @jsx jsxt */

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
  ScriptPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from '@platejs/basic-nodes/react';
import { HorizontalRulePlugin } from '@platejs/basic-nodes/react';
import { TextAlignPlugin } from '@platejs/basic-styles/react';
import { LineHeightPlugin } from '@platejs/basic-styles/react';
import { DocxPlugin } from '@platejs/docx';
import { IndentPlugin } from '@platejs/indent/react';
import { JuicePlugin } from '@platejs/juice';
import { LinkPlugin } from '@platejs/link/react';
import { ImagePlugin } from '@platejs/media/react';
import { TablePlugin } from '@platejs/table/react';
import { jsxt } from '@platejs/test-utils';
import { BaseParagraphPlugin } from 'platejs';

import {
  type BaseEditor,
  createBaseEditor,
  type BasePluginInput,
} from '../../../../../../packages/core/src/lib/editor';
import { BaseListPlugin } from '../../../../../../packages/list/src/lib/BaseListPlugin';

jsxt;

const targetPluginConfig = {
  targetPluginNames: [
    BaseParagraphPlugin.name,
    H1Plugin.name,
    H2Plugin.name,
    H3Plugin.name,
  ],
};

const basicNodePlugins = [
  BlockquotePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  H4Plugin,
  H5Plugin,
  H6Plugin,
  HorizontalRulePlugin,
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  ScriptPlugin,
  UnderlinePlugin,
] as const;

const createClipboardData = (html: string, rtf?: string): DataTransfer =>
  ({
    getData: (format: string) => (format === 'text/html' ? html : rtf),
  }) as any;

const insertData = (editor: BaseEditor, data: DataTransfer) => {
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
    const editor = createBaseEditor({
      plugins: [
        ImagePlugin as BasePluginInput,
        HorizontalRulePlugin as BasePluginInput,
        LinkPlugin as BasePluginInput,
        TablePlugin as BasePluginInput,
        ...basicNodePlugins,
        LineHeightPlugin.configure(targetPluginConfig) as BasePluginInput,
        TextAlignPlugin.configure(targetPluginConfig) as BasePluginInput,
        IndentPlugin.configure(targetPluginConfig) as BasePluginInput,
        BaseListPlugin.configure(targetPluginConfig),
        DocxPlugin,
        JuicePlugin,
      ],
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
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          {
            text: 'B',
          },
        ],
        indent: 2,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          {
            text: 'A',
          },
        ],
        indent: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [
          {
            text: 'B',
          },
        ],
        indent: 2,
        listStyleType: 'lower-alpha',
        type: 'p',
      },
      {
        children: [
          {
            text: 'c',
          },
        ],
        indent: 4,
        listStyleType: 'decimal',
        type: 'p',
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
    const editor = createBaseEditor({
      plugins: [
        ImagePlugin,
        HorizontalRulePlugin,
        LinkPlugin,
        TablePlugin,
        ...basicNodePlugins,
        LineHeightPlugin.configure(targetPluginConfig),
        TextAlignPlugin.configure(targetPluginConfig),
        IndentPlugin.configure(targetPluginConfig),
        BaseListPlugin.configure(targetPluginConfig),
        DocxPlugin,
        JuicePlugin,
      ],
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
            text: 'Item 1 ', // Note: trailing space from HTML
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          {
            text: 'Item 1.1 ', // Note: trailing space from HTML
          },
        ],
        indent: 2,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          {
            text: 'Item 1.1.1',
          },
        ],
        indent: 3,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          {
            text: 'Item 2',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ]);
  });
});
