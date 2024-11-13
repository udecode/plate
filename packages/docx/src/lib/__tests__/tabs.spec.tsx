/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'tabs';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp lineHeight="115%">Some text separated{`\t`}by a tab.</hp>
        <hp lineHeight="115%">{`\t`}Tab-indented text.</hp>
      </editor>
    ),
    filename: name,
  });
});
