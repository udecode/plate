/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const basicElementsValue: any = (
  <fragment>
    <hh2>Blocks</hh2>
    <hp>
      Easily create headings of various levels, from H1 to H6, to structure your
      content and make it more organized.
    </hp>
    <hblockquote>
      Create blockquotes to emphasize important information or highlight quotes
      from external sources.
    </hblockquote>
    <hcodeblock>
      {`// Use code blocks to showcase code snippets
function greet() {
  console.info('Hello World!');
}`}
    </hcodeblock>
  </fragment>
);
