/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'inline_code';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp>
          This is an example of{' '}
          <htext code>
            inline {` `}
            {` `}code
          </htext>{' '}
          with three spaces.
        </hp>
      </editor>
    ),
    filename: name,
  });
});
