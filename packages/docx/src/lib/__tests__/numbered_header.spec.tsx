/** @jsx jsxt */

import { BaseListPlugin } from '@platejs/list';
import { jsxt } from '@platejs/test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'numbered_header';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hh1 indent={1} listStyleType="decimal">
          A Numbered Header.
        </hh1>
      </editor>
    ),
    filename: name,
    plugins: [BaseListPlugin],
  });
});
