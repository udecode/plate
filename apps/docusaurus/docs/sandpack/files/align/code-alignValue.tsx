export const alignValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const alignValue: any = (
  <fragment>
    <hh1 align="right">Alignment</hh1>
    <hp align="right">
      This block text is aligned to the right. Amet amet adipisicing voluptate
      consequat aliquip excepteur minim dolor exercitation.
    </hp>
    <hh2 align="center">Center</hh2>
    <hp align="justify">
      This block text is justified. Velit aliquip enim enim dolore sit Lorem
      Lorem aliqua anim quis qui cillum exercitation sunt non. Occaecat
      consectetur mollit amet anim est. Laborum dolore consectetur proident
      cillum qui deserunt cupidatat sint incididunt adipisicing ad pariatur
      irure id esse.
    </hp>
  </fragment>
);
`;

export const alignValueFile = {
  '/align/alignValue.tsx': alignValueCode,
};
