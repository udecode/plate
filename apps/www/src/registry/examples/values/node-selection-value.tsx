/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const nodeSelectionValue: Value = (
  <fragment>
    <hheading level={2}>Node Selection</hheading>
    <hp>
      <htext>
        Drag from the editor padding to select one or more document nodes.
      </htext>
    </hp>
    <hp>Node selections support:</hp>
    <hp indent={1} listType="bulleted">
      <htext>Bulk actions across exact selected nodes.</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      Hold Shift while dragging to keep nodes from the previous selection.
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>
        Native editor focus, keyboard input, and clipboard commands.
      </htext>
    </hp>
  </fragment>
);
