/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { createIndentPlugin } from '../../../../../blocks/indent/src/createIndentPlugin';
import { createIndentListPlugin } from '../../../../../blocks/indent-list/src/createIndentListPlugin';
import { createBasicElementsPlugin } from '../../../../../elements/basic-elements/src/createBasicElementPlugins';
import { ELEMENT_PARAGRAPH } from '../../../../../elements/paragraph/src/createParagraphPlugin';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'lists';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hh2>Some nested lists</hh2>
        <hp indent={1} listStyleType="decimal" start={1}>
          one
        </hp>
        <hp indent={1} listStyleType="decimal" start={2}>
          two
        </hp>
        <hp indent={2} listStyleType="lower-alpha" start={1}>
          a
        </hp>
        <hp indent={2} listStyleType="lower-alpha" start={2}>
          b
        </hp>
        <hp indent={1} listStyleType="disc">
          one
        </hp>
        <hp indent={1} listStyleType="disc">
          two
        </hp>
        <hp indent={2} listStyleType="disc">
          three
        </hp>
        <hp indent={3} listStyleType="disc">
          four
        </hp>
        <hp indent={3}>four</hp>
        <hp indent={1}>Same list</hp>
        <hp indent={1}>Different list adjacent to the one above.</hp>
      </editor>
    ),
    plugins: [
      createBasicElementsPlugin(),
      createIndentListPlugin(),
      createIndentPlugin(),
    ],
    overrides: {
      [ELEMENT_PARAGRAPH]: {
        deserialize: {
          rules: [{ nodeNames: 'P' }],
          getNode: (el) => {
            console.log(el.className);
            console.log(el.style['mso-list']);

            return { type: ELEMENT_PARAGRAPH };
          },
        },
      },
    },
  });
});
