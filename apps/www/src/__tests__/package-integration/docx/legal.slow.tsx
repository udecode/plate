/** @jsx jsxt */

import { BaseListPlugin } from '@platejs/list';
import { jsxt } from '@platejs/test-utils';

import { getDocxTestName, testDocxDeserializer } from './testDocxDeserializer';

jsxt;

const name = 'legal';

describe(getDocxTestName(name), () => {
  testDocxDeserializer({
    expected: (
      <editor>
        <hp textAlign="center">
          <htext bold>TITLE</htext>
        </hp>
        <hp textIndent={1}>
          <htext />
        </hp>
        <hp textAlign="center">
          <htext bold>Name</htext>
        </hp>
        <hp textAlign="justify" lineHeight="normal" textIndent={1}>
          A
        </hp>
        <hp textAlign="justify">
          <htext bold italic>
            Bylaws
          </htext>
        </hp>
        <hp textAlign="justify" indent={1}>
          A
        </hp>
        <hp textAlign="justify" indent={1}>
          B
        </hp>
        <hp textAlign="justify">
          <htext bold italic>
            Board of Directors
          </htext>
        </hp>
        <hp textAlign="justify" indent={1}>
          A
        </hp>
        <hp textAlign="justify" indent={1}>
          B
        </hp>
        <hp textAlign="center" lineHeight="normal" textIndent={1}>
          (<htext italic>signature page follows</htext>)
        </hp>
        <hp textAlign="justify" lineHeight="normal" textIndent={1}>
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
    plugins: [BaseListPlugin],
  });
});
