/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const basicElementsValue: any = (
  <fragment>
    <hh2>块</hh2>
    <hp>轻松创建从 H1 到 H6 的各级标题，以构建你的内容结构，使其更有条理。</hp>
    <hblockquote>
      创建引用块来强调重要信息或突出显示来自外部来源的引用。
    </hblockquote>
    <hcodeblock lang="javascript">
      <hcodeline>// Use code blocks to showcase code snippets</hcodeline>
      <hcodeline>{`function greet() {`}</hcodeline>
      <hcodeline>{`  console.info('Hello World!');`}</hcodeline>
      <hcodeline>{`}`}</hcodeline>
    </hcodeblock>
  </fragment>
);
