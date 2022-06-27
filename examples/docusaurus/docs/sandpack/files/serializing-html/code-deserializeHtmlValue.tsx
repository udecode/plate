export const deserializeHtmlValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const deserializeHtmlValue: any = (
  <fragment>
    <hh1>Deserialize HTML</hh1>
    <hp>
      By default, pasting content into a Slate editor will use the clipboard's{' '}
      <htext code>'text/plain'</htext>
      data. That's okay for some use cases, but sometimes you want users to be
      able to paste in content and have it maintain its formatting. To do this,
      your editor needs to handle <htext code>'text/html'</htext>
      data.
    </hp>
    <hp>This is an example of doing exactly that!</hp>
    <hp>
      Try it out for yourself! Copy and paste some rendered HTML rich text
      content (not the source code) from another site into this editor and it's
      formatting should be preserved.
    </hp>
    <hp>
      <htext />
    </hp>
  </fragment>
);
`;

export const deserializeHtmlValueFile = {
  '/serializing-html/deserializeHtmlValue.tsx': deserializeHtmlValueCode,
};
