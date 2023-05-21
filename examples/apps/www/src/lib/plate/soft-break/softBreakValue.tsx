/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createList } from '@/plate/list/createList';

jsx;

export const softBreakValue: any = (
  <fragment>
    <hh1>🍦 Soft Break ⇧⏎</hh1>
    <hp>You can define a set of rules with:</hp>
    {createList([
      'hotkey – e.g. press ⇧⏎ anywhere to insert a soft break 👇',
      'query – filter the block types where the rule applies, e.g. pressing ⏎ will insert a soft break only inside block quotes and code blocks.',
    ])}
    <hblockquote>Try here ⏎</hblockquote>
    <hcodeblock>
      <hcodeline>And ⏎ here.</hcodeline>
    </hcodeblock>
  </fragment>
);
