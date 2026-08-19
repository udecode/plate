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
        <hheading level={1} indent={1} listType="numbered">
          A Numbered Header.
        </hheading>
      </editor>
    ),
    filename: name,
    plugins: [BaseListPlugin],
  });
});
