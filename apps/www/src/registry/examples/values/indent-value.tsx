/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const indentValue: Value = (
  <fragment>
    <hheading level={2}>Indentation</hheading>
    <hp indent={1}>
      Easily control the indentation of specific blocks to highlight important
      information and improve visual structure.
    </hp>
    <hp indent={2}>
      For instance, this paragraph looks like it belongs to the previous one.
    </hp>
  </fragment>
);
