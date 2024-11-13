/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'codeblock';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp>This is some code:</hp>
        <hcodeblock>
          <hcodeline>readDocx :: ReaderOptions</hcodeline>
          <hcodeline>
            {` `}
            {` `}
            {` `}
            {` `}
            {` `}
            {` `}
            {` `}
            {` `} -{'>'} B.ByteString
          </hcodeline>
          <hcodeline>
            {` `}
            {` `}
            {` `}
            {` `}
            {` `}
            {` `}
            {` `}
            {` `} -{'>'} Pandoc
          </hcodeline>
        </hcodeblock>
        <hp>from the beginning of the docx reader.</hp>
      </editor>
    ),
    filename: name,
  });
});
