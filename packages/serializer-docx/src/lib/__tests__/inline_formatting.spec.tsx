/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'inline_formatting';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp>
          Regular text <htext italic>italics</htext>
          <htext bold>bold </htext>
          <htext bold italic>
            bold italics
          </htext>
          .
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          This is Small Caps, and this is{' '}
          <htext strikethrough>strikethrough</htext>.
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          Some people use <htext underline>single underlines for </htext>
          <htext italic underline>
            emphasis
          </htext>
          .
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          Above the line is <htext superscript>superscript</htext> and below the
          line is <htext subscript>subscript</htext>.
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          A line{`\n`}
          break.
        </hp>
        <hp>
          <htext />
        </hp>
      </editor>
    ),
    filename: name,
  });
});
