/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const columnValue: any = (
  <fragment>
    <hh2>列</hh2>
    <hp>创建列，在查看时边框将被隐藏</hp>
    <hcolumngroup layout={[50, 50]}>
      <hcolumn width="50%">
        <hp>左侧</hp>
      </hcolumn>
      <hcolumn width="50%">
        <hp>右侧</hp>
      </hcolumn>
    </hcolumngroup>
  </fragment>
);
