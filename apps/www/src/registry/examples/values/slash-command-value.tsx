/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const slashCommandValue: Value = (
  <fragment>
    <hheading level={2}>
      <htext>Slash Command</htext>
    </hheading>
    <hp>
      <htext>
        The slash menu provides quick access to various formatting options and
        content types.
      </htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Type '/' anywhere in your document to open the slash menu.</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>
        Start typing to filter options or use arrow keys to navigate.
      </htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Press Enter or click to select an option.</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Press Escape to close the menu without selecting.</htext>
    </hp>
    <hp>Available options include:</hp>
    <hp indent={1} listType="bulleted">
      <htext>Headings: Heading 1, Heading 2, Heading 3</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Lists: Bulleted list, Numbered list</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Inline Elements: Date</htext>
    </hp>
    {/* <hcallout variant="info" icon="💡">
      <htext>
        Use keywords to quickly find options. For example, type '/h1' for
        Heading 1, '/ul' for Bulleted list, or '/date' for Date insertion.
      </htext>
    </hcallout> */}
  </fragment>
);
