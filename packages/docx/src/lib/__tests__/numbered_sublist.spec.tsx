/** @jsx jsxt */

import { BaseIndentListPlugin } from '@udecode/plate-indent-list';
import { jsxt } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'numbered_sublist';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp indent={1} listStyleType="decimal">
          a
        </hp>
        <hp indent={2} listStyleType="lower-alpha">
          b
        </hp>
        <hp indent={3} listStyleType="lower-roman">
          c
        </hp>
        <hp indent={3} listStart={2} listStyleType="lower-roman">
          d
        </hp>
        <hp indent={2} listStart={2} listStyleType="lower-alpha">
          e
        </hp>
        <hp indent={2} listStart={3} listStyleType="lower-alpha">
          f
        </hp>
        <hp indent={2} listStart={4} listStyleType="lower-alpha">
          g
        </hp>
        <hp indent={2} listStart={5} listStyleType="lower-alpha">
          h
        </hp>
        <hp indent={2} listStart={6} listStyleType="lower-alpha">
          i
        </hp>
        <hp indent={2} listStart={7} listStyleType="lower-alpha">
          j
        </hp>
        <hp indent={2} listStart={8} listStyleType="lower-alpha">
          k
        </hp>
        <hp indent={2} listStart={9} listStyleType="lower-alpha">
          l
        </hp>
        <hp indent={2} listStart={10} listStyleType="lower-alpha">
          m
        </hp>
        <hp indent={2} listStyleType="upper-roman">
          a
        </hp>
        <hp indent={2} listStart={2} listStyleType="upper-roman">
          b
        </hp>
        <hp indent={1} listStyleType="upper-alpha">
          a
        </hp>
        <hp indent={1} listStart={2} listStyleType="upper-alpha">
          b
        </hp>
        <hp indent={1} listStyleType="decimal-leading-zero">
          a
        </hp>
        <hp indent={1} listStart={2} listStyleType="decimal-leading-zero">
          b
        </hp>
      </editor>
    ),
    filename: name,
    plugins: [BaseIndentListPlugin],
  });
});
