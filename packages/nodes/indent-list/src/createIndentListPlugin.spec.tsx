/** @jsx jsx */
import { createAlignPlugin } from '@udecode/plate-alignment';
import { createBasicMarksPlugin } from '@udecode/plate-basic-marks';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '@udecode/plate-heading';
import { createIndentPlugin } from '@udecode/plate-indent';
import { createJuicePlugin } from '@udecode/plate-juice';
import { createImagePlugin } from '@udecode/plate-media';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { createTablePlugin } from '@udecode/plate-table';
import { jsx } from '@udecode/plate-test-utils';
import { createIndentListPlugin } from './createIndentListPlugin';

import { createPlateEditor } from '@/core/src/index';
import { createBasicElementsPlugin } from '@/nodes/basic-elements/src/index';
import { createHorizontalRulePlugin } from '@/nodes/horizontal-rule/src/index';
import { createLineHeightPlugin } from '@/nodes/line-height/src/index';
import { createLinkPlugin } from '@/nodes/link/src/index';
import { alignPlugin } from '@/plate/align/alignPlugin';
import { lineHeightPlugin } from '@/plate/line-height/lineHeightPlugin';
import { createDeserializeDocxPlugin } from '@/serializers/docx/src/index';

jsx;

const createClipboardData = (html: string, rtf?: string): DataTransfer =>
  ({
    getData: (format: string) => (format === 'text/html' ? html : rtf),
  } as any);

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
        createImagePlugin(),
        createHorizontalRulePlugin(),
        createLinkPlugin(),
        createTablePlugin(),
        createBasicElementsPlugin(),
        createBasicMarksPlugin(),
        createTablePlugin(),
        createLineHeightPlugin(lineHeightPlugin as any),
        createAlignPlugin(alignPlugin as any),
        createIndentPlugin({
          inject: {
            props: {
              validTypes: [
                ELEMENT_PARAGRAPH,
                ELEMENT_H1,
                ELEMENT_H2,
                ELEMENT_H3,
              ],
            },
          },
        }),
        createIndentListPlugin(),
        createDeserializeDocxPlugin(),
        createJuicePlugin(),
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
