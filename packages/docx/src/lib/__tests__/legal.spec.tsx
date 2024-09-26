/** @jsx jsx */

import { BaseIndentListPlugin } from '@udecode/plate-indent-list';
import { jsx } from '@udecode/plate-test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsx;

const name = 'legal';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
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
        <hp align="justify" lineHeight="normal" textIndent={1}>
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
        <hp align="center" lineHeight="normal" textIndent={1}>
          (<htext italic>signature page follows</htext>)
        </hp>
        <hp align="justify" lineHeight="normal" textIndent={1}>
          C
        </hp>
        <hp indent={7}>
          <htext underline>{'\t'}</htext>
          {'\n'}Name
        </hp>
        <hp indent={7}>Date of signature: </hp>
        <hp indent={7}>
          <htext />
        </hp>
        <hp indent={7}>__________________________________</hp>
      </editor>
    ),
    filename: name,
    plugins: [BaseIndentListPlugin],
  });
});
