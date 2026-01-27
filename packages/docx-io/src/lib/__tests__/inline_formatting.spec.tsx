/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { getDocxTestName, testDocxImporter } from './testDocxImporter';

jsx;

const name = 'inline_formatting';

// mammoth output: bold=<strong>, italic=<em>, strikethrough=<s>, sup/sub preserved
// NOTE: underline is lost by mammoth
describe(getDocxTestName(name), () => {
  testDocxImporter({
    expected: (
      <editor>
        <hp>
          Regular text <htext italic>italics</htext> <htext bold>bold </htext>
          <htext bold italic>
            bold italics
          </htext>
          .
        </hp>
        <hp>
          This is Small Caps, and this is{' '}
          <htext strikethrough>strikethrough</htext>.
        </hp>
        <hp>
          Some people use single underlines for <htext italic>emphasis</htext>.
        </hp>
        <hp>
          Above the line is <htext superscript>superscript</htext> and below the
          line is <htext subscript>subscript</htext>.
        </hp>
        <hp>A line{`\n`}break.</hp>
      </editor>
    ),
    filename: name,
  });
});
