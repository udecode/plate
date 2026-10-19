/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test';
import type { Value } from 'platejs';

jsx;

export const fontValue: Value = (
  <fragment>
    <hheading level={2}>颜色</hheading>
    <hp>
      添加{' '}
      <htext color="white" backgroundColor="#df4538">
        多
      </htext>
      <htext color="white" backgroundColor="#e2533a">
        种
      </htext>
      <htext color="white" backgroundColor="#e6603d">
        颜
      </htext>
      <htext color="white" backgroundColor="#e96f40">
        色
      </htext>
      <htext color="white" backgroundColor="#ec7d43">
        效
      </htext>
      <htext color="white" backgroundColor="#ef8a45">
        果
      </htext>{' '}
      <htext color="rgb(252, 109, 38)">字体</htext>和{' '}
      <htext color="white" backgroundColor="rgb(252, 109, 38)">
        背景
      </htext>{' '}
      颜色，创造生动醒目的文本效果。
    </hp>
  </fragment>
);
