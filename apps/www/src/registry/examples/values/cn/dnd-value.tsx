/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const dndValue: Value = (
  <fragment>
    <hheading level={2}>拖放</hheading>
    <hp>拖动区块来重新组织文档。</hp>
    <hp indent={1} listType="bulleted">
      <htext>
        将鼠标悬停在区块左侧以显示手柄，然后拖动手柄。一条线会标出区块的落点。
      </htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>选中多个区块可以一起拖动。列表项会带上它的嵌套项。</htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>
        放下时按住 Option（macOS）或 Ctrl（其他系统）会复制而不是移动。
      </htext>
    </hp>
    <hp indent={1} listType="bulleted">
      <htext>
        点击手柄可使用上移、下移和剪切，也可以按 Mod+Shift+Up 和
        Mod+Shift+Down。
      </htext>
    </hp>
    <hp>在这些项目上试试：</hp>
    <hp indent={1} listType="numbered">
      <htext>第一项</htext>
    </hp>
    <hp indent={2} listType="numbered">
      <htext>嵌套在第一项下</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>第二项</htext>
    </hp>
    <hp indent={1} listType="numbered">
      <htext>第三项</htext>
    </hp>
  </fragment>
);
