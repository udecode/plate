/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const basicBlocksValue: any = (
  <fragment>
    <hh2>块</hh2>
    <hp>轻松创建从 H1 到 H6 的各级标题，以构建你的内容结构，使其更有条理。</hp>
    <hblockquote>
      <hp>引用块可以在同一个容器中组合多个段落、引用列表和回复内容。</hp>
      <hp>当你需要保留引用层级时，可以继续在引用块内部嵌套引用块。</hp>
      <hblockquote>
        <hp>嵌套引用块可以清楚表达谁在回复谁。</hp>
      </hblockquote>
    </hblockquote>
    <hcodeblock lang="javascript">
      <hcodeline>// Use code blocks to showcase code snippets</hcodeline>
      <hcodeline>{'function greet() {'}</hcodeline>
      <hcodeline>{`  console.info('Hello World!');`}</hcodeline>
      <hcodeline>{'}'}</hcodeline>
    </hcodeblock>
  </fragment>
);
