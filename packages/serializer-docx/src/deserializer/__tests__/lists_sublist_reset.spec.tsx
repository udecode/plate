/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

import { createIndentListPlugin } from '@/packages/indent-list/src/createIndentListPlugin';

jsx;

const name = 'lists_sublist_reset';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hp indent={1} listStyleType="decimal" lineHeight="107%">
          Head 1
        </hp>
        <hp indent={2} listStyleType="decimal" lineHeight="107%">
          Head 1.1
        </hp>
        <hp indent={2} listStyleType="decimal" listStart={2} lineHeight="107%">
          Head 1.2
        </hp>
        <hp indent={1} listStyleType="decimal" listStart={2} lineHeight="107%">
          Head 2
        </hp>
        <hp indent={2} listStyleType="decimal" lineHeight="107%">
          Head 2.1
        </hp>
      </editor>
    ),
    plugins: [createIndentListPlugin()],
  });
});
