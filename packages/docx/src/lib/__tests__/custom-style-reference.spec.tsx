/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'custom-style-reference';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp>This is some text.</hp>
        <hp>
          <htext />
        </hp>
        <hp>
          This is text with an <htext italic>emphasized</htext> text style. And
          this is text with a <htext bold>strengthened</htext> text style.
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>Here is a styled paragraph that inherits from Block Text.</hp>
      </editor>
    ),
    filename: name,
  });
});
