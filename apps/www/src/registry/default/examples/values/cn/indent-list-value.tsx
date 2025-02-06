/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const indentListValue: any = (
  <fragment>
    <hh2>缩进列表</hh2>

    <hp>创建具有多个缩进级别的列表，并为每个级别自定义列表样式类型。</hp>
    <hp checked={true} indent={1} listStyleType="todo">
      待办事项 1
    </hp>

    <hp indent={1} listStyleType="fire">
      图标 1
    </hp>
    <hp indent={2} listStyleType="fire">
      图标 2
    </hp>
    <hp checked={false} indent={3} listStyleType="todo">
      待办事项 2
    </hp>
    <hp indent={1} listStyleType="upper-roman">
      罗马数字 1
    </hp>
    <hp indent={2} listStyleType="decimal">
      数字 11
    </hp>
    <hp indent={3} listStart={2} listStyleType="decimal">
      数字 111
    </hp>
    <hp indent={3} listStart={2} listStyleType="decimal">
      数字 112
    </hp>

    {/* <hp indent={3} listStyleType="lower-latin"> */}
    {/*  7K-T */}
    {/* </hp> */}
    {/* <hp indent={3} listStyleType="lower-latin"> */}
    {/*  7K-TM */}
    {/* </hp> */}
    <hp indent={2} listStart={2} listStyleType="decimal">
      数字 12
    </hp>
    <hp indent={2} listStart={3} listStyleType="decimal">
      数字 13
    </hp>
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  联盟号 TMA (已退役) */}
    {/* </hp> */}
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  联盟号 TMA-M (已退役) */}
    {/* </hp> */}
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  联盟号 MS */}
    {/* </hp> */}
    <hp indent={1} listStart={2} listStyleType="upper-roman">
      罗马数字 2
    </hp>
    <hp indent={2} listStyleType="decimal">
      数字 11
    </hp>
    <hp indent={2} listStart={2} listStyleType="decimal">
      数字 12
    </hp>
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  发现号 */}
    {/* </hp> */}
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  亚特兰蒂斯号 */}
    {/* </hp> */}
    {/* <hp indent={2} listStyleType="decimal"> */}
    {/*  奋进号 */}
    {/* </hp> */}
    <hp indent={1} listStart={3} listStyleType="upper-roman">
      罗马数字 3
    </hp>
    <hp indent={1} listStart={4} listStyleType="upper-roman">
      罗马数字 4
    </hp>
  </fragment>
);
