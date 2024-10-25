/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const slashCommandValue: any = (
  <fragment>
    <hh2>
      <htext>Slash Menu</htext>
    </hh2>
    <hp>
      <htext>
        The slash menu provides quick access to various formatting options and
        content types.
      </htext>
    </hp>
    <hp>How to use the slash menu:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Type '/' anywhere in your document to open the slash menu.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Start typing to filter options or use arrow keys to navigate.
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Press Enter or click to select an option.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Press Escape to close the menu without selecting.</htext>
    </hp>
    <hp>Available options include:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Headings: Heading 1, Heading 2, Heading 3</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Lists: Bulleted list, Numbered list</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
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
