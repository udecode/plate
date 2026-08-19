/** @jsx jsxt */

import { BaseListPlugin } from '@platejs/list';
import { jsxt } from '@platejs/test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'lists';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hheading level={2}>Some nested lists</hheading>
        <hp indent={1} listType="numbered">
          one
        </hp>
        <hp indent={1} listType="numbered">
          two
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          a
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          b
        </hp>
        <hp indent={1} listType="bulleted">
          one
        </hp>
        <hp indent={1} listType="bulleted">
          two
        </hp>
        <hp indent={2} listType="bulleted">
          three
        </hp>
        <hp indent={3} listType="bulleted">
          four
        </hp>
        <hp indent={3}>Sub paragraph</hp>
        <hp indent={1} listType="bulleted">
          Same list
        </hp>
        <hp indent={1} listType="bulleted">
          Different list adjacent to the one above.
        </hp>
      </editor>
    ),
    filename: name,
    plugins: [BaseListPlugin],
  });
});
