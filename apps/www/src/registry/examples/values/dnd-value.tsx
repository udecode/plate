/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const dndValue: Value = (
  <fragment>
    <hheading level={2}>Drag and Drop</hheading>
    <hp>Reorganize a document by dragging its blocks.</hp>
    <hp indent={1} listType="bulleted">
      <htext>
        Hover over the left side of a block to see its handle, then drag the
        handle. A line shows where the block will land.
      </htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>
        Select several blocks to drag them together. A list item carries its
        nested items.
      </htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>
        Hold Option on macOS, or Ctrl elsewhere, when you drop to copy instead
        of move.
      </htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>
        Click a handle for Move up, Move down and Cut, or press Mod+Shift+Up and
        Mod+Shift+Down.
      </htext>
    </hp>
    <hp>Try it on these items:</hp>
    <hp indent={1} listType="numbered">
      <htext>First item</htext>
    </hp>
    <hp indent={2} listType="numbered">
      <htext>Nested under the first item</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>Second item</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>Third item</htext>
    </hp>
  </fragment>
);
