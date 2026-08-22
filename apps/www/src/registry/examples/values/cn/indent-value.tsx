/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const indentValue: Value = (
  <fragment>
    <hheading level={2}>缩进</hheading>
    <hp indent={1}>轻松控制特定块的缩进，以突出显示重要信息并改善视觉结构。</hp>
    <hp indent={2}>例如，这段文字看起来像是属于前一段的内容。</hp>
  </fragment>
);
