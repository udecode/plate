/** @jsx jsxt */
import { jsxt } from '@platejs/test';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'codeblock';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp>This is some code:</hp>
        <hcodeblock>
          readDocx :: ReaderOptions{'\n'}
          {'         -> B.ByteString'}
          {'\n'}
          {'         -> Pandoc'}
        </hcodeblock>
        <hp>from the beginning of the docx reader.</hp>
      </editor>
    ),
    filename: name,
  });
});
