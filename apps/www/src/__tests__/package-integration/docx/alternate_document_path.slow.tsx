/** @jsx jsxt */
import { jsxt } from '@platejs/test';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'alternate_document_path';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hheading level={1} lineHeight="107%">
          Test
        </hheading>
        <hp lineHeight="107%">
          <htext />
        </hp>
        <hp lineHeight="107%">
          This is <htext italic>italic</htext>, <htext bold>bold</htext>,{' '}
          <htext underline>underlined</htext>,{' '}
          <htext italic underline>
            italic underlined
          </htext>
          ,{' '}
          <htext bold underline>
            bold underlined
          </htext>
          ,{' '}
          <htext bold italic underline>
            bold italic underlined
          </htext>
          .
        </hp>
        <hp lineHeight="107%">
          <htext />
        </hp>
      </editor>
    ),
    filename: name,
  });
});
