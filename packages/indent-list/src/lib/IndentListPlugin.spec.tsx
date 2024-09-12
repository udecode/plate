/** @jsx jsx */

import { AlignPlugin } from '@udecode/plate-alignment/react';
import { BasicElementsPlugin } from '@udecode/plate-basic-elements/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { createPlateEditor } from '@udecode/plate-common/react';
import { DocxPlugin } from '@udecode/plate-docx';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { ImagePlugin } from '@udecode/plate-media/react';
import { TablePlugin } from '@udecode/plate-table/react';
import { jsx } from '@udecode/plate-test-utils';

import { BaseIndentListPlugin } from './BaseIndentListPlugin';

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

const createClipboardData = (html: string, rtf?: string): DataTransfer =>
  ({
    getData: (format: string) => (format === 'text/html' ? html : rtf),
  }) as any;

describe('when insertData disc and decimal from gdocs', () => {
  it('should ', () => {
    const editor = createPlateEditor({
      editor: (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any,
      plugins: [
        ImagePlugin,
        HorizontalRulePlugin,
        LinkPlugin,
        TablePlugin,
        BasicElementsPlugin,
        BasicMarksPlugin,
        TablePlugin,
        LineHeightPlugin.extend(injectConfig),
        AlignPlugin.extend(injectConfig),
        IndentPlugin.extend(injectConfig),
        BaseIndentListPlugin,
        DocxPlugin,
        JuicePlugin,
      ],
    });

    editor.insertData(
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
