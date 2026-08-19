/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const blockSelectionValue = (
  <fragment>
    <hheading level={2}>块选择</hheading>
    <hp>
      <htext>
        块选择允许你一次选择多个块。你可以通过从编辑器边距处点击并拖动来启动选择。
      </htext>
    </hp>
    <hp>块选择的主要功能：</hp>
    <hp indent={1} listType="bulleted">
      <htext>选择多个块。</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      按住 Shift 键以保持之前的选择。这样，你就可以选择不连续的块。
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>对选中的块执行批量操作</htext>
    </hp>
  </fragment>
);
