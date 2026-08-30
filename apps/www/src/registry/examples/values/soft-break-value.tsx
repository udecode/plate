/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';

jsx;

export const softBreakValue = (
  <fragment>
    <hheading level={2}>Soft Break</hheading>
    <hp>
      Customize how soft breaks (line breaks within a paragraph) are handled
      using configurable rules
    </hp>
    <hp indent={1} listType="bulleted">
      hotkey – Use hotkeys like ⇧⏎ to insert a soft break anywhere within a
      paragraph.
    </hp>
    <hp indent={1} listType="bulleted">
      query – Define custom rules to limit soft breaks to specific block types.
    </hp>
    <hblockquote>
      <hp>Try here ⏎</hp>
    </hblockquote>
    <hcodeblock>
      <hcodeline>And here ⏎ as well.</hcodeline>
    </hcodeblock>
  </fragment>
);
