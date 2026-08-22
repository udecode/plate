/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const mentionValue: Value = (
  <fragment>
    <hheading level={2}>提及</hheading>
    <hp>使用@提及功能在文本中提及和引用其他用户或实体。</hp>
    <hp>
      试试提及{' '}
      <hmention ref="BB-8">
        <htext />
      </hmention>{' '}
      或{' '}
      <hmention ref="Boba Fett">
        <htext />
      </hmention>
      。
    </hp>
  </fragment>
);
