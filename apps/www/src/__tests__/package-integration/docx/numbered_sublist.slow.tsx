/** @jsx jsxt */

import { jsxt } from '@platejs/test';
import { BaseListPlugin } from 'platejs';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'numbered_sublist';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp indent={1} listId="a" listType="numbered">
          a
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          b
        </hp>
        <hp indent={3} listStyle="lower-roman" listId="a" listType="numbered">
          c
        </hp>
        <hp indent={3} listStyle="lower-roman" listId="a" listType="numbered">
          d
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          e
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          f
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          g
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          h
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          i
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          j
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          k
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          l
        </hp>
        <hp indent={2} listStyle="lower-alpha" listId="a" listType="numbered">
          m
        </hp>
        <hp indent={2} listStyle="upper-roman" listId="b" listType="numbered">
          a
        </hp>
        <hp indent={2} listStyle="upper-roman" listId="b" listType="numbered">
          b
        </hp>
        <hp indent={1} listStyle="upper-alpha" listId="c" listType="numbered">
          a
        </hp>
        <hp indent={1} listStyle="upper-alpha" listId="c" listType="numbered">
          b
        </hp>
        <hp
          indent={1}
          listStyle="decimal-leading-zero"
          listId="d"
          listType="numbered"
        >
          a
        </hp>
        <hp
          indent={1}
          listStyle="decimal-leading-zero"
          listId="d"
          listType="numbered"
        >
          b
        </hp>
      </editor>
    ),
    filename: name,
    plugins: [BaseListPlugin],
  });
});
