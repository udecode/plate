/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const deserializeMdValue: Value = (
  <fragment>
    <hheading level={2}>Markdown</hheading>
    <hp>
      Copy and paste Markdown content from popular Markdown editors like{' '}
      <ha url="https://markdown-it.github.io/">markdown-it.github.io/</ha> into
      the editor for easy conversion and editing.
    </hp>
    <hp>
      Try nested blockquotes, quoted list items, and reply-style quote chains to
      keep their structure intact after paste.
    </hp>
  </fragment>
);
