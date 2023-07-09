/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'custom-style-reference';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
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
  });
});
