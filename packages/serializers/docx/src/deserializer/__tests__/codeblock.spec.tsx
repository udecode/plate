/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { createBasicElementsPlugin } from '../../../../../elements/basic-elements/src/createBasicElementPlugins';
import { createDeserializeDocxPlugin } from '../createDeserializeDocxPlugin';
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
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -{'>'} B.ByteString
          </hcodeline>
          <hcodeline>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -{'>'} Pandoc
          </hcodeline>
        </hcodeblock>
        <hp>from the beginning of the docx reader.</hp>
      </editor>
    ),
    plugins: [createBasicElementsPlugin(), createDeserializeDocxPlugin()],
  });
});
