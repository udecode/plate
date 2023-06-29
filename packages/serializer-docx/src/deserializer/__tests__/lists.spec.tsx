/** @jsx jsx */

import { createIndentListPlugin } from '@/packages/indent-list/src/createIndentListPlugin';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'lists';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hh2>Some nested lists</hh2>
        <hp indent={1} listStyleType="decimal">
          one
        </hp>
        <hp indent={1} listStyleType="decimal" listStart={2}>
          two
        </hp>
        <hp indent={2} listStyleType="lower-alpha">
          a
        </hp>
        <hp indent={2} listStyleType="lower-alpha" listStart={2}>
          b
        </hp>
        <hp indent={1} listStyleType="disc">
          one
        </hp>
        <hp indent={1} listStyleType="disc" listStart={2}>
          two
        </hp>
        <hp indent={2} listStyleType="disc">
          three
        </hp>
        <hp indent={3} listStyleType="disc">
          four
        </hp>
        <hp indent={3}>Sub paragraph</hp>
        <hp indent={1} listStyleType="disc" listStart={3}>
          Same list
        </hp>
        <hp indent={1} listStyleType="disc" listStart={4}>
          Different list adjacent to the one above.
        </hp>
      </editor>
    ),
    plugins: [createIndentListPlugin()],
  });
});
