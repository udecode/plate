/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const basicMarksValue: any = (
  <fragment>
    <hh2>标记</hh2>
    <hp>使用标记插件为你的文本添加样式和强调，它提供了多种格式化选项。</hp>
    <hp>
      让文本变得<htext bold>粗体</htext>、<htext italic>斜体</htext>、
      <htext underline>下划线</htext>，或应用这些样式的
      <htext bold italic underline>
        组合
      </htext>
      来创造视觉冲击效果。
    </hp>
    <hp>
      添加<htext strikethrough>删除线</htext>来表示已删除或过时的内容。
    </hp>
    <hp>
      使用内联<htext code>代码</htext>格式编写代码片段，提高可读性。
    </hp>
  </fragment>
);
