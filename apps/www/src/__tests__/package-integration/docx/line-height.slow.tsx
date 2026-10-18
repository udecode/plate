/** @jsx jsxt */
import { jsxt } from '@platejs/test';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'line-height';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hheading level={1} lineHeight={2}>
          Line-height 2.0
        </hheading>
        <hp lineHeight={1.5}>Line-height 1.5</hp>
        <hp lineHeight={1.5}>Line-height 1.5</hp>
      </editor>
    ),
    filename: name,
  });
});
