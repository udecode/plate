/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import { createList } from './createList';

jsx;

export const softBreakValue: any = (
  <fragment>
    <hh2>Soft Break ⇧⏎</hh2>
    <hp>
      Customize how soft breaks (line breaks within a paragraph) are handled
      using configurable rules
    </hp>
    {createList([
      'hotkey – Use hotkeys like ⇧⏎ to insert a soft break anywhere within a paragraph.',
      'query – Define custom rules to limit soft breaks to specific block types.',
    ])}
    <hblockquote>Try here ⏎</hblockquote>
    <hcodeblock>
      <hcodeline>And here ⏎ as well.</hcodeline>
    </hcodeblock>
  </fragment>
);
