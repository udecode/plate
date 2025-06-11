/** @jsx jsxt */

import { KEYS } from 'platejs';
import { BasicBlocksPlugin } from '@platejs/basic-nodes/react';
import { HorizontalRulePlugin } from '@platejs/basic-nodes/react';
import { BasicMarksPlugin } from '@platejs/basic-nodes/react';
import { TextAlignPlugin } from '@platejs/basic-styles/react';
import { LineHeightPlugin } from '@platejs/basic-styles/react';
import { DocxPlugin } from '@platejs/docx';
import { IndentPlugin } from '@platejs/indent/react';
import { JuicePlugin } from '@platejs/juice';
import { LinkPlugin } from '@platejs/link/react';
import { ImagePlugin } from '@platejs/media/react';
import { TablePlugin } from '@platejs/table/react';
import { jsxt } from '@platejs/test-utils';
import { ParagraphPlugin } from 'platejs/react';
import { createPlateEditor } from 'platejs/react';

import { BaseIndentListPlugin } from './BaseIndentListPlugin';

jsxt;

const injectConfig = {
  inject: {
    targetPlugins: [ParagraphPlugin.key, KEYS.h1, KEYS.h2, KEYS.h3],
  },
};

const createClipboardData = (html: string, rtf?: string): DataTransfer =>
  ({
    getData: (format: string) => (format === 'text/html' ? html : rtf),
  }) as any;

describe('when insertData disc and decimal from gdocs', () => {
  it('should ', () => {
    const e = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any;
    const editor = createPlateEditor({
      plugins: [
        ImagePlugin,
        HorizontalRulePlugin,
        LinkPlugin,
        TablePlugin,
        BasicBlocksPlugin,
        BasicMarksPlugin,
        TablePlugin,
        LineHeightPlugin.extend(injectConfig),
        TextAlignPlugin.extend(injectConfig),
        IndentPlugin.extend(injectConfig),
        BaseIndentListPlugin,
        DocxPlugin,
        JuicePlugin,
      ],
      selection: e.selection,
      value: e.children,
    });

    editor.tf.insertData(
      createClipboardData(
        `<b style="font-weight:normal;" id="docs-internal-guid-4f8ed8e9-7fff-b83b-9190-aa89959d7b6d"><ul style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:disc;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">A</span></p></li><ul style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:disc;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="2"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">B</span></p></li></ul></ul><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:decimal;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="1"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">A</span></p></li><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:lower-alpha;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;" aria-level="2"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">B</span></p></li><ol style="margin-top:0;margin-bottom:0;padding-inline-start:48px;"><li dir="ltr" style="list-style-type:decimal;font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;margin-left: 36pt;" aria-level="4"><p dir="ltr" style="line-height:1.38;margin-top:0pt;margin-bottom:0pt;" role="presentation"><span style="font-size:11pt;font-family:Arial;color:#000000;background-color:transparent;font-weight:400;font-style:normal;font-variant:normal;text-decoration:none;vertical-align:baseline;white-space:pre;white-space:pre-wrap;">c</span></p></li></ol></ol></ol></b>`
      )
    );

    expect(editor.children).toEqual([
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
