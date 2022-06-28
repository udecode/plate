export const lineHeightValueCode = `/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@udecode/plate-test-utils';

jsx;

const lorem =
  'Laborum dolor et tempor consectetur amet ullamco consectetur ullamco irure incididunt reprehenderit ullamco nulla tempor. Laboris veniam commodo id in ex ullamco incididunt nulla eu Lorem adipisicing deserunt duis ad. Mollit magna enim exercitation amet proident reprehenderit magna nulla officia ad in non. Magna magna adipisicing fugiat cillum do esse eu adipisicing. Culpa dolor non Lorem. Dolore non voluptate velit in eu culpa velit. Exercitation fugiat cupidatat adipisicing duis veniam proident irure ea excepteur aliqua esse ad cupidatat adipisicing id. Ut exercitation proident ea eiusmod enim non minim proident Lorem aliqua officia voluptate ullamco culpa Lorem. Exercitation eiusmod dolor nostrud qui excepteur. Dolor commodo duis reprehenderit excepteur laboris do minim qui.';

export const lineHeightValue: any = (
  <fragment>
    <hh1>Line Height</hh1>
    <hp>This block text has default line height. {lorem}</hp>
    <hp lineHeight={2}>
      This block text has a little bigger line height. {lorem}
    </hp>
    <hh1 lineHeight={3}>Anything could have a Line Height</hh1>
    <hp lineHeight={1}>
      This block text has the same line height as ist font size. {lorem}
    </hp>
  </fragment>
);
`;

export const lineHeightValueFile = {
  '/line-height/lineHeightValue.tsx': lineHeightValueCode,
};
