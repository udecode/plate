/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const blockSelectionValue: any = (
  <fragment>
    <hh2>块选择</hh2>
    <hp>
      <htext>
        块选择允许你一次选择多个块。你可以通过从编辑器边距处点击并拖动来启动选择。
      </htext>
    </hp>
    <hp>块选择的主要功能：</hp>
    <hp indent={1} listStyleType="disc">
      <htext>选择多个块。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      按住 Shift 键以保持之前的选择。这样，你就可以选择不连续的块。
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>对选中的块执行批量操作</htext>
    </hp>
  </fragment>
);
