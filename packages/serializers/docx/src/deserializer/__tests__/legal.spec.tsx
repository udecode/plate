/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { createIndentListPlugin } from '../../../../../blocks/indent-list/src/createIndentListPlugin';
import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'legal';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hp align="center">
          <htext bold>TITLE</htext>
        </hp>
        <hp>
          <htext />
        </hp>
        <hp align="center">
          <htext bold>Name</htext>
        </hp>
        <hp align="justify" indent={1} lineHeight="normal">
          A
        </hp>
        <hp align="justify">
          <htext bold italic>
            Bylaws
          </htext>
        </hp>
        <hp align="justify" indent={1}>
          A
        </hp>
        <hp align="justify" indent={1}>
          B
        </hp>
        <hp align="justify">
          <htext bold italic>
            Board of Directors
          </htext>
        </hp>
        <hp align="justify" indent={1}>
          A
        </hp>
        <hp align="justify" indent={1}>
          B
        </hp>
        <hp align="center">
          (<htext italic>signature page follows</htext>)
        </hp>
        <hp align="justify" indent={1}>
          C
        </hp>
      </editor>
    ),
    plugins: [createIndentListPlugin()],
  });
});
