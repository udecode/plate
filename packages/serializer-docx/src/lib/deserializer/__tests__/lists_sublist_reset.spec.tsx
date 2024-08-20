/** @jsx jsx */

import { IndentListPlugin } from '@udecode/plate-indent-list';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'lists_sublist_reset';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp indent={1} lineHeight="107%" listStyleType="decimal">
          Head 1
        </hp>
        <hp indent={2} lineHeight="107%" listStyleType="decimal">
          Head 1.1
        </hp>
        <hp indent={2} lineHeight="107%" listStart={2} listStyleType="decimal">
          Head 1.2
        </hp>
        <hp indent={1} lineHeight="107%" listStart={2} listStyleType="decimal">
          Head 2
        </hp>
        <hp indent={2} lineHeight="107%" listStyleType="decimal">
          Head 2.1
        </hp>
      </editor>
    ),
    filename: name,
    plugins: [IndentListPlugin],
  });
});
