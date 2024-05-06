/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const toggleValue: any = (
  <fragment>
    <hh2>🦚 Toggle</hh2>
    <hp>Create toggles with multiple levels of indentation</hp>
    <htoggle id="dlks89">Level 1 toggle</htoggle>
    <hp indent={1}>Inside level 1 toggle</hp>
    <htoggle id="kjdd12" indent={1}>
      Level 2 toggle
    </htoggle>
    <hp indent={2}>Inside level 2 toggle</hp>
    <hp>After toggles</hp>
  </fragment>
);
