export const lineHeightValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { faker } from '@faker-js/faker';
import { jsx } from '@udecode/plate-test-utils';

jsx;

export const lineHeightValue: any = (
  <fragment>
    <hh1>Line Height</hh1>
    <hp>This block text has default line height. {faker.lorem.paragraph()}</hp>
    <hp lineHeight={2}>
      This block text has a little bigger line height. {faker.lorem.paragraph()}
    </hp>
    <hh1 lineHeight={3}>Anything could have a Line Height</hh1>
    <hp lineHeight={1}>
      This block text has the same line height as ist font size.{' '}
      {faker.lorem.paragraph()}
    </hp>
  </fragment>
);
`;

export const lineHeightValueFile = {
  '/line-height/lineHeightValue.tsx': lineHeightValueCode,
};
