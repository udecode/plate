/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const clearFormattingValue: Value = (
  <fragment>
    <hheading level={2}>清除格式</hheading>
    <hp>
      选中一段文字，按 <htext code>Mod+\</htext> 或点击工具栏的清除格式按钮。
      <htext bold>粗体</htext>、<htext italic>斜体</htext>、
      <htext color="#df4538">颜色</htext>和
      <htext backgroundColor="#fff3a3">高亮</htext>等文字样式都会去掉。
    </hp>
    <hp lineHeight={2} textAlign="center">
      选中整个段落，对齐方式和行高也会一并重置。
    </hp>
    <hp indent={1} listType="bulleted">
      列表项保留项目符号和层级，只去掉
      <htext bold underline>
        文字样式
      </htext>
      。
    </hp>
    <hp>
      标题和链接会保留，
      <ha url="https://platejs.org">
        <htext bold>这个链接</htext>
      </ha>
      的地址不变。
    </hp>
  </fragment>
);
