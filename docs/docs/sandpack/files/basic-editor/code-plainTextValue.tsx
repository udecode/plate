export const plainTextValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const plainTextValue: any = (
  <fragment>
    <hp>
      This is editable plain text with react and history plugins, just like a
      textarea!
    </hp>
  </fragment>
);
`;

export const plainTextValueFile = {
  '/basic-editor/plainTextValue.tsx': plainTextValueCode,
};
