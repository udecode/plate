/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const listValue = (
  <fragment>
    <hheading level={2}>List</hheading>

    <hp>
      Create indented lists with multiple levels of indentation and customize
      the list style type for each level.
    </hp>
    <hp checked={true} indent={1} listType="task">
      Todo 1
    </hp>

    <hp indent={1} listType="bulleted">
      Disc 1
    </hp>
    <hp indent={2} listType="bulleted">
      Disc 2
    </hp>
    <hp checked={false} indent={3} listType="task">
      Todo 2
    </hp>
    <hp indent={1} listStyle="upper-roman" listType="numbered">
      Roman 1
    </hp>
    <hp indent={2} listType="numbered">
      Decimal 11
    </hp>
    <hp indent={3} listType="numbered">
      Decimal 111
    </hp>
    <hp indent={3} listType="numbered">
      Decimal 112
    </hp>

    {/* <hp indent={3} listStyle="lower-latin" listType="numbered"> */}
    {/*  7K-T */}
    {/* </hp> */}
    {/* <hp indent={3} listStyle="lower-latin" listType="numbered"> */}
    {/*  7K-TM */}
    {/* </hp> */}
    <hp indent={2} listType="numbered">
      Decimal 12
    </hp>
    <hp indent={2} listType="numbered">
      Decimal 13
    </hp>
    {/* <hp indent={2} listType="numbered"> */}
    {/*  Soyuz TMA (retired) */}
    {/* </hp> */}
    {/* <hp indent={2} listType="numbered"> */}
    {/*  Soyuz TMA-M (retired) */}
    {/* </hp> */}
    {/* <hp indent={2} listType="numbered"> */}
    {/*  Soyuz MS */}
    {/* </hp> */}
    <hp indent={1} listStyle="upper-roman" listType="numbered">
      Roman 2
    </hp>
    <hp indent={2} listType="numbered">
      Decimal 11
    </hp>
    <hp indent={2} listType="numbered">
      Decimal 12
    </hp>
    {/* <hp indent={2} listType="numbered"> */}
    {/*  Discovery */}
    {/* </hp> */}
    {/* <hp indent={2} listType="numbered"> */}
    {/*  Atlantis */}
    {/* </hp> */}
    {/* <hp indent={2} listType="numbered"> */}
    {/*  Endeavour */}
    {/* </hp> */}
    <hp indent={1} listStyle="upper-roman" listType="numbered">
      Roman 3
    </hp>
    <hp indent={1} listStyle="upper-roman" listType="numbered">
      Roman 4
    </hp>
  </fragment>
);
