/** @jsx jsxt */

import { jsxt } from '@platejs/test';
import { BaseListPlugin } from 'platejs';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'lists_sublist_reset';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp indent={1} lineHeight="107%" listType="numbered">
          Head 1
        </hp>
        <hp indent={2} lineHeight="107%" listType="numbered">
          Head 1.1
        </hp>
        <hp indent={2} lineHeight="107%" listType="numbered">
          Head 1.2
        </hp>
        <hp indent={1} lineHeight="107%" listType="numbered">
          Head 2
        </hp>
        <hp indent={2} lineHeight="107%" listType="numbered">
          Head 2.1
        </hp>
      </editor>
    ),
    filename: name,
    plugins: [BaseListPlugin],
  });
});
