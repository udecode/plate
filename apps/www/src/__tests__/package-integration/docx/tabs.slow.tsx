/** @jsx jsxt */
import { jsxt } from '@platejs/test';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'tabs';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp lineHeight={1.15}>Some text separated{'\t'}by a tab.</hp>
        <hp lineHeight={1.15}>{'\t'}Tab-indented text.</hp>
      </editor>
    ),
    filename: name,
  });
});
