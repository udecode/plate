/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'codeblock';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
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
  });
});
