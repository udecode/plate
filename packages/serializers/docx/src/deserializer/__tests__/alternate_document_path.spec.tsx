/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'alternate_document_path';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hh1>Test</hh1>
        <hp>
          <htext />
        </hp>
        <hp>
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
        <hp>
          <htext />
        </hp>
      </editor>
    ),
  });
});
