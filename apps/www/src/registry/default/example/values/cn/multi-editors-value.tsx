/** @jsxRuntime classic */
/** @jsx jsx */
import type { Descendant } from '@udecode/plate';

import { jsx } from '@udecode/plate-test-utils';

jsx;

export const createMultiEditorsValue = () => {
  const multiEditors: Descendant[][] = [];

  for (let h = 0; h < 300; h++) {
    const multiEditor: Descendant[] = [];
    multiEditor.push((<hh1>这是一个示例标题文本。</hh1>) as any);

    for (let p = 0; p < 2; p++) {
      multiEditor.push(
        (
          <hp>
            这是一段示例段落文本，用于演示多编辑器功能。它包含了一些随机生成的中文内容，
            用来测试编辑器的性能和功能。这段文字没有特定的含义，主要是为了填充空间和测试
            目的。您可以尝试编辑这段文字，添加新的内容，或者删除一些内容。编辑器支持各种
            格式化选项，比如加粗、斜体、下划线等。您还可以尝试更改文字的对齐方式、添加列
            表或者插入图片等功能。这个示例展示了编辑器处理长文本的能力，以及在多个编辑器
            实例中同时工作的能力。您可以根据需要自定义编辑器的行为和外观。
          </hp>
        ) as any
      );
    }

    multiEditors.push(multiEditor);
  }

  return multiEditors;
};
