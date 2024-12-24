/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const listValue: any = (
  <fragment>
    <hh2>✍️ 列表</hh2>
    <hp>
      <htext />
    </hp>
    <hul>
      <hli>
        <hlic>猫</hlic>
      </hli>
      <hli>
        <hlic>狗</hlic>
      </hli>
      <hli>
        <hlic>鸟</hlic>
        <hul>
          <hli>
            <hlic>鹦鹉</hlic>
          </hli>
          <hli>
            <hlic>猫头鹰</hlic>
            <hul>
              <hli>
                <hlic>仓鸮</hlic>
              </hli>
              <hli>
                <hlic>雪鸮</hlic>
              </hli>
            </hul>
          </hli>
        </hul>
      </hli>
    </hul>
    <hol>
      <hli>
        <hlic>红色</hlic>
      </hli>
      <hli>
        <hlic>蓝色</hlic>
        <hul>
          <hli>
            <hlic>浅蓝色</hlic>
          </hli>
          <hli>
            <hlic>深蓝色</hlic>
            <hol>
              <hli>
                <hlic>海军蓝</hlic>
              </hli>
              <hli>
                <hlic>青蓝色</hlic>
              </hli>
            </hol>
          </hli>
        </hul>
      </hli>
      <hli>
        <hlic>绿色</hlic>
      </hli>
    </hol>
  </fragment>
);

export const todoListValue: any = (
  <fragment>
    <hp>每个块都是一个 React 组件，您可以在其中管理状态：</hp>
    <hp checked={true} indent={1} listStyleType="todo">
      创建一个"香蕉语言"翻译插件
    </hp>
    <hp checked={true} indent={1} listStyleType="todo">
      创建一个"检测讽刺"插件（祝你好运）
    </hp>
    <hp checked={false} indent={1} listStyleType="todo">
      创建一个 AI 自动完成插件
    </hp>
  </fragment>
);
