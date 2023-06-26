/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

import { createIndentListPlugin } from '@/packages/indent-list/src/createIndentListPlugin';

jsx;

const name = 'numbered_sublist';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
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
        <hp indent={3} listStyleType="lower-roman" listStart={2}>
          d
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={2}>
          e
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={3}>
          f
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={4}>
          g
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={5}>
          h
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={6}>
          i
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={7}>
          j
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={8}>
          k
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={9}>
          l
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={10}>
          m
        </hp>
        <hp indent={2} listStyleType="upper-roman">
          a
        </hp>
        <hp indent={2} listStyleType="upper-roman" listStart={2}>
          b
        </hp>
        <hp indent={1} listStyleType="upper-alpha">
          a
        </hp>
        <hp indent={1} listStyleType="upper-alpha" listStart={2}>
          b
        </hp>
        <hp indent={1} listStyleType="decimal-leading-zero">
          a
        </hp>
        <hp indent={1} listStyleType="decimal-leading-zero" listStart={2}>
          b
        </hp>
      </editor>
    ),
    plugins: [createIndentListPlugin()],
  });
});
