/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const indentListValue: any = (
  <fragment>
    <hh2>Indent List</hh2>
    <hp>
      Create indented lists with multiple levels of indentation and customize
      the list style type for each level.
    </hp>
    <hp indent={1} listStyleType="upper-roman">
      Roman 1
    </hp>
    <hp indent={2} listStyleType="decimal">
      Decimal 11
    </hp>
    <hp indent={3} listStyleType="decimal">
      Decimal 111
    </hp>
    <hp indent={3} listStyleType="decimal">
      Decimal 112
    </hp>
    {/* <hp indent={3} listStyleType="lower-latin"> */}
    {/*  7K-T */}
    {/* </hp> */}
    {/* <hp indent={3} listStyleType="lower-latin"> */}
    {/*  7K-TM */}
    {/* </hp> */}
    <hp indent={2} listStyleType="decimal">
      Decimal 12
    </hp>
    <hp indent={2} listStyleType="decimal">
      Decimal 13
    </hp>
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  Soyuz TMA (retired) */}
    {/* </hp> */}
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  Soyuz TMA-M (retired) */}
    {/* </hp> */}
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  Soyuz MS */}
    {/* </hp> */}
    <hp indent={1} listStyleType="upper-roman">
      Roman 2
    </hp>
    <hp indent={2} listStyleType="decimal">
      Decimal 11
    </hp>
    <hp indent={2} listStyleType="decimal">
      Decimal 12
    </hp>
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  Discovery */}
    {/* </hp> */}
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  Atlantis */}
    {/* </hp> */}
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  Endeavour */}
    {/* </hp> */}
    <hp indent={1} listStyleType="upper-roman">
      Roman 3
    </hp>
    <hp indent={1} listStyleType="upper-roman">
      Roman 4
    </hp>
  </fragment>
);
