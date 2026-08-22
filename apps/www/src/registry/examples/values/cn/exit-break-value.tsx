/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

import { createTable } from './table-value';

jsx;

export const trailingBlockValue: Value = (
  <fragment>
    <hheading level={2}>尾随块</hheading>
    <hp>始终在编辑器末尾保留一个尾随段落。</hp>
  </fragment>
);

export const exitBreakValue: Value = (
  <fragment>
    <hheading level={2}>退出换行</hheading>
    <hp>使用简单的规则配置退出换行（块之间的换行）的行为：</hp>

    <hp indent={1} listType="bulleted">
      快捷键 – 使用快捷键如 ⌘⏎ 将光标移动到下一个块
    </hp>
    <hp indent={1} listType="bulleted">
      查询 – 指定允许退出换行的块类型
    </hp>
    <hp indent={1} listType="bulleted">
      之前 – 选择光标是退出到下一个还是上一个块
    </hp>

    <hcodeblock>
      <hcodeline>在块的中间 ⌘⏎ 使用。</hcodeline>
    </hcodeblock>
    <hp>退出换行在嵌套块中也可以使用：</hp>
    {createTable()}
  </fragment>
);
