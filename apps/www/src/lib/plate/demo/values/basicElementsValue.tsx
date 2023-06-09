/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

import { mapNodeId } from '@/plate/demo/mapNodeId';

jsx;

export const basicElementsValue: any = mapNodeId(
  <fragment>
    <hh1>🌳 Blocks</hh1>
    <hp>
      Easily create headings of various levels, from H1 to H6, to structure your
      content and make it more organized.
    </hp>
    <hblockquote>
      Create blockquotes to emphasize important information or highlight quotes
      from external sources.
    </hblockquote>
    <hcodeblock lang="javascript">
      {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
      <hcodeline>// Use code blocks to showcase code snippets</hcodeline>
      <hcodeline>{`function greet() {`}</hcodeline>
      <hcodeline>{`  console.info('Hello World!');`}</hcodeline>
      <hcodeline>{`}`}</hcodeline>
    </hcodeblock>
  </fragment>
);
