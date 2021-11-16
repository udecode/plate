/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { createParagraphPlugin } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { MARK_BOLD } from '../../../../../marks/basic-marks/src/bold/createBoldPlugin';
import { createBasicMarksPlugin } from '../../../../../marks/basic-marks/src/createBasicMarksPlugin';
import { MARK_ITALIC } from '../../../../../marks/basic-marks/src/italic/createItalicPlugin';
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
        deserialize: {
          rules: [
            { nodeNames: ['STRONG', 'B'] },
            {
              style: {
                fontWeight: ['600', '700', 'bold'],
              },
            },
          ],
          getNode: (el) => {
            if (
              ['STRONG', 'B'].includes(el.nodeName) &&
              (el.children[0] as HTMLElement)?.style.fontWeight === 'normal'
            ) {
              return undefined;
            }

            return { [MARK_BOLD]: true };
          },
        },
      },
      [MARK_ITALIC]: {
        deserialize: {
          getNode: (el) => {
            if (
              el.nodeName === 'EM' &&
              (el.children[0] as HTMLElement)?.style.fontStyle === 'normal'
            ) {
              return undefined;
            }

            return { [MARK_ITALIC]: true };
          },
        },
      },
    },
  });
});
