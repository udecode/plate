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
        <hp indent={1} listType="numbered">
          a
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          b
        </hp>
        <hp indent={3} listStyle="lower-roman" listType="numbered">
          c
        </hp>
        <hp indent={3} listStyle="lower-roman" listType="numbered">
          d
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          e
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          f
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          g
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          h
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          i
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          j
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          k
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          l
        </hp>
        <hp indent={2} listStyle="lower-alpha" listType="numbered">
          m
        </hp>
        <hp
          indent={2}
          listRestart={1}
          listStyle="upper-roman"
          listType="numbered"
        >
          a
        </hp>
        <hp indent={2} listStyle="upper-roman" listType="numbered">
          b
        </hp>
        <hp
          indent={1}
          listRestart={1}
          listStyle="upper-alpha"
          listType="numbered"
        >
          a
        </hp>
        <hp indent={1} listStyle="upper-alpha" listType="numbered">
          b
        </hp>
        <hp
          indent={1}
          listRestart={1}
          listStyle="decimal-leading-zero"
          listType="numbered"
        >
          a
        </hp>
        <hp indent={1} listStyle="decimal-leading-zero" listType="numbered">
          b
        </hp>
      </editor>
    ),
    filename: name,
    plugins: [BaseListPlugin],
  });
});
