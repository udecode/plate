/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const editableVoidsValue: any = (
  <fragment>
    <hp>
      除了包含可编辑文本的节点外，您还可以插入空节点，这些节点也可以包含可编辑元素、
      输入框或整个其他的Slate编辑器。
    </hp>
    <element type="editable-void">
      <htext />
    </element>
    <hp>
      <htext />
    </hp>
  </fragment>
);
