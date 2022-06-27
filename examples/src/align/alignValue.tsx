/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';
import * as faker from 'faker';

jsx;

export const alignValue: any = (
  <fragment>
    <hh1 align="right">Alignment</hh1>
    <hp align="right">
      This block text is aligned to the right. {faker.lorem.paragraph()}
    </hp>
    <hh2 align="center">Center</hh2>
    <hp align="justify">
      This block text is justified. {faker.lorem.paragraph()}
    </hp>
  </fragment>
);
