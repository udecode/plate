/** @jsx jsxt */
import { jsxt } from '@platejs/test';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'dummy_item_after_list_item';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp indent={1} lineHeight={1.15} listId="a" listType="numbered">
          One
        </hp>
        <hp indent={1} lineHeight={1.15}>
          Two{'\n'}
          {'\n'}Three
        </hp>
      </editor>
    ),
    filename: name,
  });
});
