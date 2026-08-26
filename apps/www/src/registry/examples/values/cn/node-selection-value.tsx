/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const nodeSelectionValue: Value = (
  <fragment>
    <hheading level={2}>节点选择</hheading>
    <hp>
      <htext>从编辑器边距拖动以选择一个或多个文档节点。</htext>
    </hp>
    <hp>节点选择支持：</hp>
    <hp indent={1} listType="bulleted">
      <htext>对精确选择的节点执行批量操作。</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      按住 Shift 键拖动以保留上一次选择中的节点。
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>使用编辑器焦点、键盘输入和剪贴板命令。</htext>
    </hp>
  </fragment>
);
