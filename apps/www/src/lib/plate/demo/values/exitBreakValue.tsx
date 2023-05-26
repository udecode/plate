/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { createList } from './createList';
import { createTable } from './tableValue';

jsx;

export const exitBreakValue: any = (
  <fragment>
    <hh1>Exit Break ⏎</hh1>
    <hp>You can define a set of rules with:</hp>
    {createList([
      'hotkey – e.g. press ⌘⏎ to exit to the next block 👇',
      'query – Filter the block types where the rule applies.',
      'level – Path level where the exit is.',
      'before – If true, exit to the previous block. e.g. press ⇧⌘⏎ to exit before the selected block 👆',
    ])}
    <hblockquote>Try here ⌘⏎</hblockquote>
    <hcodeblock>
      <hcodeline>And in the middle ⌘⏎ of the block.</hcodeline>
    </hcodeblock>
    <hp>It also works for nested blocks:</hp>
    {createTable()}
  </fragment>
);
