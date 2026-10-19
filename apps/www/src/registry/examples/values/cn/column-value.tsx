/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const columnValue: Value = (
  <fragment>
    <hheading level={2}>列</hheading>
    <hp>创建列，在查看时边框将被隐藏</hp>
    <hcolumngroup>
      <hcolumn width="50%">
        <hp>左侧</hp>
      </hcolumn>
      <hcolumn width="50%">
        <hp>右侧</hp>
      </hcolumn>
    </hcolumngroup>
  </fragment>
);
