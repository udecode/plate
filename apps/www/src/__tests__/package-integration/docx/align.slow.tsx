/** @jsx jsxt */
import { jsxt } from '@platejs/test';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'align';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hheading level={1} textAlign="center">
          Aligned Headers
        </hheading>
        <hheading level={2} textAlign="right">
          Second Level
        </hheading>
        <hp textAlign="justify">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </hp>
      </editor>
    ),
    filename: name,
  });
});
