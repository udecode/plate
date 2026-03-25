/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { getDocxTestName, testDocxImporter } from './testDocxImporter';

jsx;

const name = 'block_quotes';

// mammoth output: blockquote style NOT preserved (becomes p), italic lost
// NOTE: mammoth doesn't recognize Word's blockquote style
// Uses smart quotes (U+2019) from Word
describe(getDocxTestName(name), () => {
  testDocxImporter({
    expected: (
      <editor>
        <hh2>Some block quotes, in different ways</hh2>
        <hp>This is the proper way, with a style</hp>
        <hp>
          I don{'\u2019'}t know why this would be in italics, but so it appears
          to be on my screen.
        </hp>
        <hp>And this is the way that most people do it:</hp>
        <hp>
          I just indented this, so it looks like a block quote. I think this is
          how most people do block quotes in their documents.
        </hp>
        <hp>And back to the normal style.</hp>
      </editor>
    ),
    filename: name,
  });
});
