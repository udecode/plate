/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const toggleValue: any = (
  <fragment>
    <hh2>Alternância (Toggle)</hh2>
    <hp>Crie alternâncias com múltiplos níveis de indentação</hp>
    <htoggle id="dlks89">Alternância nível 1</htoggle>
    <hp indent={1}>Dentro da alternância nível 1</hp>
    <htoggle id="kjdd12" indent={1}>
      Alternância nível 2
    </htoggle>
    <hp indent={2}>Dentro da alternância nível 2</hp>
    <hp>Após alternâncias</hp>
  </fragment>
);
