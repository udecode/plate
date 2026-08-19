/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const columnValue = (
  <fragment>
    <hheading level={2}>Column</hheading>
    <hp>Create column and the border will hidden when viewing</hp>
    <hcolumngroup>
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
