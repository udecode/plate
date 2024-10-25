/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const blockMenuValue: any = (
  <fragment>
    <hh2>Block Menu</hh2>
    <hp>
      <htext>
        The Block Menu provides quick access to actions for individual blocks.
        You can open this menu by right-clicking on any block in the editor.
      </htext>
    </hp>
    <hp>Key features of the Block Context Menu:</hp>
    <hp indent={1} listStyleType="disc">
      <htext>Right-click on any block to open the menu</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        Try using block selection to select multiple blocks, then open the menu
        for the selected blocks.
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>
        When you try to right-click the block at the cursor's location, the
        default menu will open.This allows users to use browser extensions or
        paste plain text, etc.
      </htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Options to duplicate, delete, or other what you want</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>Transform blocks into different types</htext>
    </hp>
  </fragment>
);
