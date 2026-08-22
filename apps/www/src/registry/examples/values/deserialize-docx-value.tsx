/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import type { Value } from 'platejs';

jsx;

export const deserializeDocxValue: Value = (
  <fragment>
    <hheading level={2}>Docx</hheading>
    <hp>
      Easily import content from Microsoft Word documents by simply copying and
      pasting the Docx content into the editor.
    </hp>
  </fragment>
);
