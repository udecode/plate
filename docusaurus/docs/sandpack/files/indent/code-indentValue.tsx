export const indentValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const indentValue: any = (
  <fragment>
    <hh1>Changing block indentation</hh1>
    <hp indent={1}>
      Use the toolbar buttons to control the indentation of specific blocks. You
      can use these tools to highlight an important piece of information,
      communicate a hierarchy or just give your content some room.
    </hp>
    <hp indent={2}>
      For instance, this paragraph looks like it belongs to the previous one.
    </hp>
  </fragment>
);
`;

export const indentValueFile = {
  '/indent/indentValue.tsx': indentValueCode,
};
