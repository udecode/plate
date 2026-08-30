/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const cursorOverlayValue: Value = (
  <fragment>
    <hheading level={2}>光标覆盖</hheading>
    <hp>
      试着拖动文本：你会在放置目标上看到一个彩色光标：颜色和其他样式都是可以自定义的！
    </hp>
    <hp>
      你也可以尝试点击"询问 AI"按钮 -
      在聚焦到另一个输入框时选择区域会保持可见，并且在流式传输时会更新。
    </hp>
  </fragment>
);
