/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const findValue: Value = (
  <fragment>
    <hp>
      这是一段可以搜索的可编辑文本。查找结果使用临时高亮，不会把标记写入文档。
    </hp>
    <hp>按下 Mod+F，然后使用 Enter 或 Shift+Enter 在结果之间移动。</hp>
  </fragment>
);
