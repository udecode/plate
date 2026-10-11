/** @jsx jsxt */

import { jsxt } from '@platejs/test';
import { BaseListPlugin } from 'platejs';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'lists';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hheading level={2}>Some nested lists</hheading>
        <hp indent={1} listId="a" listType="numbered">
          one
        </hp>
        <hp indent={1} listId="a" listType="numbered">
          two
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="b" listType="numbered">
          a
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="b" listType="numbered">
          b
        </hp>
        <hp indent={1} listId="c" listType="bulleted">
          one
        </hp>
        <hp indent={1} listId="c" listType="bulleted">
          two
        </hp>
        <hp indent={2} listId="d" listType="bulleted">
          three
        </hp>
        <hp indent={3} listId="e" listType="bulleted">
          four
        </hp>
        <hp indent={3}>Sub paragraph</hp>
        <hp indent={1} listId="c" listType="bulleted">
          Same list
        </hp>
        <hp indent={1} listId="f" listType="bulleted">
          Different list adjacent to the one above.
        </hp>
      </editor>
    ),
    filename: name,
    plugins: [BaseListPlugin],
  });
});
