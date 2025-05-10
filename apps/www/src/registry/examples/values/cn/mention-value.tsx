/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const mentionValue: any = (
  <fragment>
    <hh2>提及</hh2>
    <hp>使用@提及功能在文本中提及和引用其他用户或实体。</hp>
    <hp>
      试试提及{' '}
      <hmention value="BB-8">
        <htext />
      </hmention>{' '}
      或{' '}
      <hmention value="Boba Fett">
        <htext />
      </hmention>
      。
    </hp>
  </fragment>
);
