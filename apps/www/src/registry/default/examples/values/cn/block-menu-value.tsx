/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const blockMenuValue: any = (
  <fragment>
    <hh2>块菜单</hh2>

    <hp>打开块菜单：</hp>
    {/* <hp indent={1} listStyleType="disc">
      <htext>点击拖动手柄以打开块菜单。</htext>
    </hp> */}
    <hp indent={1} listStyleType="disc">
      <htext>
        右键点击任何未选中的块以打开上下文菜单。如果你在已选中的块内右键点击，
        你将看到浏览器原生的上下文菜单。
      </htext>
    </hp>
    <hp>块菜单中的可用选项：</hp>
    {/* <hp indent={1} listStyleType="disc">
      <htext>为块文本添加评论。</htext>
    </hp> */}
    <hp indent={1} listStyleType="disc">
      <htext>请求 AI 编辑块。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>删除块。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>复制块。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>将块类型转换为另一种块类型。</htext>
    </hp>
    {/* <hp indent={1} listStyleType="disc">
      <htext>颜色：更新块文本颜色或背景颜色。</htext>
    </hp> */}
  </fragment>
);
