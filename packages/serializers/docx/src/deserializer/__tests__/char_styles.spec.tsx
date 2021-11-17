/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { createParagraphPlugin } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { createBasicMarksPlugin } from '../../../../../marks/basic-marks/src/createBasicMarksPlugin';
import { MARK_BOLD } from '../../../../../marks/basic-marks/src/createBoldPlugin';
import { MARK_ITALIC } from '../../../../../marks/basic-marks/src/createItalicPlugin';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'char_styles';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hp>
          <htext italic>This is all in an </htext>
          <htext italic bold>
            italic style
          </htext>
          <htext italic>.</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext italic>This is an italic </htext>style
          <htext italic> with some </htext>
          words<htext italic> unitalicized.</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext bold>This is all in a </htext>
          <htext bold italic>
            strong style
          </htext>
          <htext bold>.</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp>
          <htext bold>This is a strong </htext>style
          <htext bold> with some </htext>words<htext bold> ubolded.</htext>
        </hp>
        <hp>
          <htext />
        </hp>
      </editor>
    ),
    plugins: [createParagraphPlugin(), createBasicMarksPlugin()],
    overrides: {
      [MARK_BOLD]: {
        deserializeHtml: [
          {
            validNodeName: ['STRONG', 'B'],
            query: (el) => {
              return !(
                (el.children[0] as HTMLElement)?.style.fontWeight === 'normal'
              );
            },
          },
          {
            validStyle: {
              fontWeight: ['600', '700', 'bold'],
            },
          },
        ],
      },
      [MARK_ITALIC]: {
        deserializeHtml: {
          validNodeName: ['EM', 'I'],
          query: (el) => {
            return !(
              el.nodeName === 'EM' &&
              (el.children[0] as HTMLElement)?.style.fontStyle === 'normal'
            );
          },
        },
      },
    },
  });
});
