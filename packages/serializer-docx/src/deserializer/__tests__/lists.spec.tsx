/** @jsx jsx */

import { createIndentListPlugin } from '@udecode/plate-indent-list';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'lists';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hh2>Some nested lists</hh2>
        <hp indent={1} listStyleType="decimal">
          one
        </hp>
        <hp indent={1} listStart={2} listStyleType="decimal">
          two
        </hp>
        <hp indent={2} listStyleType="lower-alpha">
          a
        </hp>
        <hp indent={2} listStart={2} listStyleType="lower-alpha">
          b
        </hp>
        <hp indent={1} listStyleType="disc">
          one
        </hp>
        <hp indent={1} listStart={2} listStyleType="disc">
          two
        </hp>
        <hp indent={2} listStyleType="disc">
          three
        </hp>
        <hp indent={3} listStyleType="disc">
          four
        </hp>
        <hp indent={3}>Sub paragraph</hp>
        <hp indent={1} listStart={3} listStyleType="disc">
          Same list
        </hp>
        <hp indent={1} listStart={4} listStyleType="disc">
          Different list adjacent to the one above.
        </hp>
      </editor>
    ),
    filename: name,
    plugins: [createIndentListPlugin()],
  });
});
