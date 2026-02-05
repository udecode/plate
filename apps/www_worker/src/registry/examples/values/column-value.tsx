/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const columnValue: any = (
  <fragment>
    <hh2>Column</hh2>
    <hp>Create column and the border will hidden when viewing</hp>
    <hcolumngroup layout={[50, 50]}>
      <hcolumn width="50%">
        <hp>left 1</hp>
        <hp>left 2</hp>
      </hcolumn>
      <hcolumn width="50%">
        <hp>right 1</hp>
        <hp>right 2</hp>
      </hcolumn>
    </hcolumngroup>
  </fragment>
);
