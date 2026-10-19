/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@platejs/test';

jsx;

export const HUGE_CODE_BLOCK_LINE_COUNT = 10_000;

export const codeBlockPreviewValue = createCodeBlockValue(1000, 'Code Block');

export const hugeCodeBlockValue = createCodeBlockValue(
  HUGE_CODE_BLOCK_LINE_COUNT,
  'Huge Code Block'
);

function createCodeBlockValue(lineCount: number, title: string) {
  const text = Array.from(
    { length: lineCount },
    (_value, index) =>
      `const result${String(index + 1).padStart(5, '0')} = transform(source[${index}]);`
  ).join('\n');

  return (
    <fragment>
      <hheading level={2}>{title}</hheading>
      <hp>{lineCount.toLocaleString()} lines of TypeScript.</hp>
      <hcodeblock language="typescript">{text}</hcodeblock>
      <hp>End of {title.toLowerCase()}.</hp>
    </fragment>
  );
}
