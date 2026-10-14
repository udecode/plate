/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
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
    <hheading level={2}>退出块结构</hheading>
    <hp>使用快捷键退出嵌套块结构。插件会自动确定退出位置：</hp>

    <hp indent={1} listType="bulleted">
      ⌘⏎ – 退出并在当前结构之后插入新块
    </hp>
    <hp indent={1} listType="bulleted">
      ⌘⇧⏎ – 退出并在当前结构之前插入新块
    </hp>
    <hp indent={1} listType="bulleted">
      最近结构 – 代码块、提示框、图片或分割线留在所在容器中，其他块退出容器
    </hp>

    <hp>退出块结构在表格和分栏等嵌套结构中同样适用：</hp>
    <hcolumngroup>
      <hcolumn width="50%">{createTable()}</hcolumn>
      <hcolumn width="50%">
        <hcodeblock>试试 ⌘⏎ 退出此代码块。</hcodeblock>
      </hcolumn>
    </hcolumngroup>
  </fragment>
);
