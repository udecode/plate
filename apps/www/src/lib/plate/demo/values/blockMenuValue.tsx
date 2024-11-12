/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const blockMenuValue: any = (
  <fragment>
    <hh2>Block Menu</hh2>

    <hp>Open the block menu:</hp>
    {/* <hp indent={1} listStyleType="disc">
      <htext>Click on a drag handle to open the block menu.</htext>
    </hp> */}
    <hp indent={1} listStyleType="disc">
      <htext>
        Right-click any unselected block to open the context menu. If you
        right-click within a selected block, you'll see the browser's native
        context menu instead.
      </htext>
    </hp>
    <hp>Available options in the block menu:</hp>
    {/* <hp indent={1} listStyleType="disc">
      <htext>Comment the block text.</htext>
    </hp> */}
    <hp indent={1} listStyleType="disc">
      <htext>Ask AI to edit the block.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Delete the block.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Duplicate the block.</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Turn the block type into another block type.</htext>
    </hp>
    {/* <hp indent={1} listStyleType="disc">
      <htext>Color: update the block text color or background color.</htext>
    </hp> */}
  </fragment>
);
