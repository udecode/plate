/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const deserializeHtmlValue: any = (
  <fragment>
    <hh2>HTML</hh2>
    <hp>
      默认情况下，当您将内容粘贴到 Slate 编辑器中时，它会使用剪贴板的{' '}
      <htext code>'text/plain'</htext>
      数据。虽然这适用于某些场景，但有时您希望用户能够在粘贴内容时保留其格式。
      为了实现这一点，您的编辑器应该能够处理 <htext code>'text/html'</htext>
      数据。
    </hp>
    <hp>
      要体验无缝的格式保留，只需从其他网站复制并粘贴已渲染的 HTML 富文本内容
      （而不是源代码）到此编辑器中。您会注意到粘贴内容的格式得以保持。
    </hp>
  </fragment>
);
