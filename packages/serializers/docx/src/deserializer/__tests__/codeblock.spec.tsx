/** @jsx jsx */
import { createDeserializeHtmlPlugin } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { createBasicElementsPlugin } from '../../../../../elements/basic-elements/src/createBasicElementPlugins';
import {
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '../../../../../elements/code-block/src/constants';
import { deserializeHtmlCodeBlock } from '../../../../../elements/code-block/src/deserializeHtmlCodeBlockPre';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createDeserializeDocxPlugin } from '../createDeserializeDocxPlugin';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'codeblock';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hp>This is some code:</hp>
        <hcodeblock>
          <hcodeline>readDocx :: ReaderOptions</hcodeline>
          <hcodeline>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -{'>'} B.ByteString
          </hcodeline>
          <hcodeline>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -{'>'} Pandoc
          </hcodeline>
        </hcodeblock>
        <hp>from the beginning of the docx reader.</hp>
      </editor>
    ),
    plugins: [
      createBasicElementsPlugin(),
      createDeserializeHtmlPlugin(),
      createDeserializeDocxPlugin(),
    ],
    overrides: {
      [ELEMENT_PARAGRAPH]: {
        deserializeHtml: {
          query: (el) => {
            return !el.classList.contains('SourceCode');
          },
        },
      },
      [ELEMENT_CODE_BLOCK]: {
        deserializeHtml: [
          ...deserializeHtmlCodeBlock,
          {
            validClassName: 'SourceCode',
            getNode: null,
          },
        ],
      },
      [ELEMENT_CODE_LINE]: {
        deserializeHtml: {
          validClassName: 'VerbatimChar',
        },
      },
    },
  });
});
