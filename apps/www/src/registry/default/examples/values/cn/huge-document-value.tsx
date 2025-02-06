/** @jsxRuntime classic */
/** @jsx jsx */
import type { Descendant, Value } from '@udecode/plate';

import { jsx } from '@udecode/plate-test-utils';

jsx;

const HEADINGS = 100;
const PARAGRAPHS = 7;

export const createHugeDocumentValue = () => {
  const hugeDocument: Descendant[] = [];

  for (let h = 0; h < HEADINGS; h++) {
    hugeDocument.push(
      (<hh1>我们想要通过这种方式来展示和测试大型文档的性能。</hh1>) as any
    );

    for (let p = 0; p < PARAGRAPHS; p++) {
      hugeDocument.push(
        (
          <hp>
            这是一个用于测试大型文档性能的示例文本。它包含了大量重复的内容，以模拟真实的使用场景。
            通过这种方式，我们可以测试编辑器在处理大量内容时的表现。这包括滚动性能、编辑响应速度、
            内存使用情况等多个方面。我们需要确保即使在处理大量内容时，编辑器仍能保持流畅的用户体验。
            这对于需要处理长文档的用户来说尤为重要。通过这些测试，我们可以不断优化编辑器的性能，
            提供更好的用户体验。
          </hp>
        ) as any
      );
    }
  }

  return hugeDocument as Value;
};
