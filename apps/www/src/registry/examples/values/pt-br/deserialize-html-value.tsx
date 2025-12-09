/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const deserializeHtmlValue: any = (
  <fragment>
    <hh2>HTML</hh2>
    <hp>
      Por padrão, quando você cola conteúdo no editor Slate, ele utiliza os dados
      <htext code>'text/plain'</htext>
      da área de transferência. Embora isso seja adequado para certos cenários, há momentos em que
      você quer que os usuários possam colar conteúdo preservando sua
      formatação. Para conseguir isso, seu editor deve ser capaz de manipular dados{' '}
      <htext code>'text/html'</htext>.
    </hp>
    <hp>
      Para experimentar a preservação perfeita da formatação, simplesmente copie e
      cole conteúdo renderizado em HTML (não o código-fonte) de outro
      site neste editor. Você notará que a formatação do conteúdo colado
      é mantida.
    </hp>
  </fragment>
);
