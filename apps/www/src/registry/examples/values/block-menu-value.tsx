/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const blockMenuValue: Value = (
  <fragment>
    <hheading level={2}>Block Menu</hheading>

    <hp>Open the block menu:</hp>
    {/* <hp indent={1} listType="bulleted">
      <htext>Click on a drag handle to open the block menu.</htext>
    </hp> */}
    <hp indent={1} listType="bulleted">
      <htext>
        Right-click any unselected block to open the context menu. If you
        right-click within a selected block, you'll see the browser's native
        context menu instead.
      </htext>
    </hp>
    <hp>Available options in the block menu:</hp>
    {/* <hp indent={1} listType="bulleted">
      <htext>Comment the block text.</htext>
    </hp> */}
    <hp indent={1} listType="bulleted">
      <htext>Ask AI to edit the block.</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Delete the block.</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Duplicate the block.</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>Turn the block type into another block type.</htext>
    </hp>
    {/* <hp indent={1} listType="bulleted">
      <htext>Color: update the block text color or background color.</htext>
    </hp> */}
  </fragment>
);
