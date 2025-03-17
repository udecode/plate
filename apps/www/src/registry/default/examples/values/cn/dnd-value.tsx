/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const dndValue: any = (
  <fragment>
    <hh2>拖放</hh2>
    <hp>使用拖放功能轻松重新组织文档中的内容。</hp>
    <hp>使用方法：</hp>
    <hp indent={1} listStyleType="disc">
      <htext>将鼠标悬停在块的左侧以查看拖动手柄（六个点）。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>点击并按住手柄，然后将块拖动到新位置。</htext>
    </hp>
    <hp indent={1} listStyleType="disc">
      <htext>松开以将块放置在新位置。</htext>
    </hp>
    <hp>试一试！拖动这些项目来重新排序：</hp>
    <hp indent={1} listStyleType="decimal">
      <htext>第一项</htext>
    </hp>
    <hp indent={1} listStart={2} listStyleType="decimal">
      <htext>第二项</htext>
    </hp>
    <hp indent={1} listStart={3} listStyleType="decimal">
      <htext>第三项</htext>
    </hp>
  </fragment>
);
