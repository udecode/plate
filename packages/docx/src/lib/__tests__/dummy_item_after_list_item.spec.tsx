/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'dummy_item_after_list_item';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp indent={1} lineHeight="115%" listStyleType="decimal">
          One
        </hp>
        <hp indent={1} lineHeight="115%">
          Two{'\n'}
          {'\n'}Three
        </hp>
      </editor>
    ),
    filename: name,
  });
});
