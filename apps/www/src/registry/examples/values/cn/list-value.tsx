/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const listValue: Value = (
  <fragment>
    <hheading level={2}>缩进列表</hheading>

    <hp>创建具有多个缩进级别的列表，并为每个级别自定义列表样式类型。</hp>
    <hp checked={true} indent={1} listType="task">
      待办事项 1
    </hp>

    <hp indent={1} listType="bulleted">
      1
    </hp>
    <hp indent={2} listType="bulleted">
      2
    </hp>
    <hp checked={false} indent={3} listType="task">
      待办事项 2
    </hp>
    <hp indent={1} listStyle="upper-roman" listType="numbered">
      罗马数字 1
    </hp>
    <hp indent={2} listType="numbered">
      数字 11
    </hp>
    <hp indent={3} listType="numbered">
      数字 111
    </hp>
    <hp indent={3} listType="numbered">
      数字 112
    </hp>

    {/* <hp indent={3} listStyle="lower-latin" listType="numbered"> */}
    {/*  7K-T */}
    {/* </hp> */}
    {/* <hp indent={3} listStyle="lower-latin" listType="numbered"> */}
    {/*  7K-TM */}
    {/* </hp> */}
    <hp indent={2} listType="numbered">
      数字 12
    </hp>
    <hp indent={2} listType="numbered">
      数字 13
    </hp>
    {/* <hp indent={2} listType="numbered"> */}
    {/*  联盟号 TMA (已退役) */}
    {/* </hp> */}
    {/* <hp indent={2} listType="numbered"> */}
    {/*  联盟号 TMA-M (已退役) */}
    {/* </hp> */}
    {/* <hp indent={2} listType="numbered"> */}
    {/*  联盟号 MS */}
    {/* </hp> */}
    <hp indent={1} listStyle="upper-roman" listType="numbered">
      罗马数字 2
    </hp>
    <hp indent={2} listType="numbered">
      数字 11
    </hp>
    <hp indent={2} listType="numbered">
      数字 12
    </hp>
    {/* <hp indent={2} listType="numbered"> */}
    {/*  发现号 */}
    {/* </hp> */}
    {/* <hp indent={2} listType="numbered"> */}
    {/*  亚特兰蒂斯号 */}
    {/* </hp> */}
    {/* <hp indent={2} listType="numbered"> */}
    {/*  奋进号 */}
    {/* </hp> */}
    <hp indent={1} listStyle="upper-roman" listType="numbered">
      罗马数字 3
    </hp>
    <hp indent={1} listStyle="upper-roman" listType="numbered">
      罗马数字 4
    </hp>
  </fragment>
);
