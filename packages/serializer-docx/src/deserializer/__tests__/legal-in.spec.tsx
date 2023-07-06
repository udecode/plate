/** @jsx jsx */

import { createIndentListPlugin } from '@/packages/indent-list/src/createIndentListPlugin';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'legal-in';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    filename: name,
    expected: (
      <editor>
        <hp align="center">
          <htext bold>TITLE</htext>
        </hp>
        <hp textIndent={1}>
          <htext />
        </hp>
        <hp align="center">
          <htext bold>Name</htext>
        </hp>
        <hp align="justify" textIndent={1} lineHeight="normal">
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
        <hp align="center" textIndent={1} lineHeight="normal">
          (<htext italic>signature page follows</htext>)
        </hp>
        <hp align="justify" textIndent={1} lineHeight="normal">
          C
        </hp>
        <hp indent={7}>
          <htext underline>{'\t'}</htext>
          Name
        </hp>
        <hp indent={7}>Date of signature: </hp>
        <hp indent={7}>
          <htext />
        </hp>
        <hp indent={7}>__________________________________</hp>
      </editor>
    ),
    plugins: [createIndentListPlugin()],
  });
});
