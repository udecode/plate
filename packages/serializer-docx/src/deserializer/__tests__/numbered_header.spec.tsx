/** @jsx jsx */

import { createIndentListPlugin } from '@/packages/indent-list/src/createIndentListPlugin';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'numbered_header';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hh1 indent={1} listStyleType="decimal">
          A Numbered Header.
        </hh1>
      </editor>
    ),
    plugins: [createIndentListPlugin()],
  });
});
