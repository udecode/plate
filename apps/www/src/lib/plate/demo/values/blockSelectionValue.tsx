/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const blockSelectionValue: any = (
  <fragment>
    <hh2>Block Selection</hh2>
    <hp>
      <htext>
        Block selection allows you to select multiple blocks at once.You can
        initiate a selection by clicking and dragging from the editor padding.
      </htext>
    </hp>
    <hp>Key features of block selection:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Select multiple blocks.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      Keep pressing Shift to keep the previous selection. That way, you can
      select non-contiguous blocks.
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Perform bulk actions on selected blocks</htext>
    </hp>
  </fragment>
);
