/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'block_quotes';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hh2>Some block quotes, in different ways</hh2>
        <hp>
          <htext />
        </hp>
        <hp>This is the proper way, with a style</hp>
        <hp>
          <htext />
        </hp>
        <hblockquote>
          <htext italic>
            I don’t know why this would be in italics, but so it appears to be
            on my screen.
          </htext>
        </hblockquote>
        <hp>
          <htext />
        </hp>
        <hp>And this is the way that most people do it:</hp>
        <hp>
          <htext />
        </hp>
        <hp indent={2}>
          I just indented this, so it looks like a block quote. I think this is
          how most people do block quotes in their documents.
        </hp>
        <hp indent={2}>
          <htext />
        </hp>
        <hp>And back to the normal {` `}style.</hp>
      </editor>
    ),
    filename: name,
  });
});
