/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const dndValue: any = (
  <fragment>
    <hh2>Drag and Drop</hh2>
    <hp>Easily reorganize content within your document using drag and drop.</hp>
    <hp>How to use:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Hover over the left side of a block to see the drag handle (six dots).
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Click and hold the handle, then drag the block to a new location.
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Release to drop the block in its new position.</htext>
    </hp>
    <hp>Try it out! Drag these items to reorder them:</hp>
    <hp indent={1} listStyleType="decimal">
      <htext>First item</htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>Second item</htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>Third item</htext>
    </hp>
  </fragment>
);
