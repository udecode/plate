/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const editableVoidsValue: Value = (
  <fragment>
    <hp>
      In addition to nodes that contain editable text, you can insert void
      nodes, which can also contain editable elements, inputs, or an entire
      other Plate editor.
    </hp>
    <element type="editable-void">
      <htext />
    </element>
    <hp>
      <htext />
    </hp>
  </fragment>
);
