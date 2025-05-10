/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const editableVoidsValue: any = (
  <fragment>
    <hp>
      In addition to nodes that contain editable text, you can insert void
      nodes, which can also contain editable elements, inputs, or an entire
      other Slate editor.
    </hp>
    <element type="editable-void">
      <htext />
    </element>
    <hp>
      <htext />
    </hp>
  </fragment>
);
