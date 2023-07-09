/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { createList } from './createList';
import { createTable } from './tableValue';

jsx;

export const trailingBlockValue: any = (
  <fragment>
    <hh2>Trailing Block</hh2>
    <hp>Always have a trailing paragraph at the end of your editor.</hp>
  </fragment>
);

export const exitBreakValue: any = (
  <fragment>
    <hh2>Exit Break ⏎</hh2>
    <hp>
      Configure how exit breaks (line breaks between blocks) behave using simple
      rules:
    </hp>
    {createList([
      'hotkey – Use hotkeys like ⌘⏎ to move the cursor to the next block',
      'query – Specify block types where exit breaks are allowed.',
      'before – Choose whether the cursor exits to the next or previous block',
    ])}
    <hblockquote>Try here ⌘⏎</hblockquote>
    <hcodeblock>
      <hcodeline>And in the middle ⌘⏎ of a block.</hcodeline>
    </hcodeblock>
    <hp>Exit breaks also work within nested blocks:</hp>
    {createTable()}
  </fragment>
);
