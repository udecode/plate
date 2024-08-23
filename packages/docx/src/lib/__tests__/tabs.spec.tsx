/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

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
