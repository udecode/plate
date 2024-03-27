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
    <hp indent={1} listStyleType="todo" checked={true}>
      Todo 1
    </hp>

    <hp indent={1} listStyleType="fire">
      Icon 1
    </hp>
    <hp indent={2} listStyleType="fire">
      Icon 2
    </hp>
    <hp indent={3} listStyleType="todo" checked={false}>
      Todo 2
    </hp>
    <hp indent={1} listStyleType="upper-roman">
      Roman 1
    </hp>
    <hp indent={2} listStyleType="decimal">
      Decimal 11
    </hp>
    <hp indent={3} listStyleType="decimal" listStart={2}>
      Decimal 111
    </hp>
    <hp indent={3} listStyleType="decimal" listStart={2}>
      Decimal 112
    </hp>

    {/* <hp indent={3} listStyleType="lower-latin"> */}
    {/*  7K-T */}
    {/* </hp> */}
    {/* <hp indent={3} listStyleType="lower-latin"> */}
    {/*  7K-TM */}
    {/* </hp> */}
    <hp indent={2} listStyleType="decimal" listStart={2}>
      Decimal 12
    </hp>
    <hp indent={2} listStyleType="decimal" listStart={3}>
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
    <hp indent={1} listStyleType="upper-roman" listStart={2}>
      Roman 2
    </hp>
    <hp indent={2} listStyleType="decimal">
      Decimal 11
    </hp>
    <hp indent={2} listStyleType="decimal" listStart={2}>
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
    <hp indent={1} listStyleType="upper-roman" listStart={3}>
      Roman 3
    </hp>
    <hp indent={1} listStyleType="upper-roman" listStart={4}>
      Roman 4
    </hp>
  </fragment>
);
