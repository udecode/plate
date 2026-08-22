/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const blockSelectionValue: Value = (
  <fragment>
    <hheading level={2}>Block Selection</hheading>
    <hp>
      <htext>
        Block selection allows you to select multiple blocks at once.You can
        initiate a selection by clicking and dragging from the editor padding.
      </htext>
    </hp>
    <hp>Key features of block selection:</hp>
    <hp indent={1} listType="bulleted">
      <htext>Select multiple blocks.</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      Keep pressing Shift to keep the previous selection. That way, you can
      select non-contiguous blocks.
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Perform bulk actions on selected blocks</htext>
    </hp>
  </fragment>
);
