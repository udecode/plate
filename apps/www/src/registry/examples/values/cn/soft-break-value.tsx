/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const softBreakValue: any = (
  <fragment>
    <hh2>软换行</hh2>
    <hp>使用可配置的规则来自定义如何处理软换行（段落内的换行）</hp>
    <hp indent={1} listStyleType="disc">
      快捷键 – 使用像 ⇧⏎ 这样的快捷键在段落中的任何位置插入软换行。
    </hp>
    <hp indent={1} listStyleType="disc">
      查询 – 定义自定义规则以将软换行限制在特定的块类型中。
    </hp>
    <hblockquote>在这里试试 ⏎</hblockquote>
    <hcodeblock>
      <hcodeline>这里也可以试试 ⏎</hcodeline>
    </hcodeblock>
  </fragment>
);
