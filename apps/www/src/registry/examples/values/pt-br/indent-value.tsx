/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const indentValue: any = (
  <fragment>
    <hh2>Indentação</hh2>
    <hp indent={1}>
      Controle facilmente a indentação de blocos específicos para destacar informações
      importantes e melhorar a estrutura visual.
    </hp>
    <hp indent={2}>
      Por exemplo, este parágrafo parece pertencer ao anterior.
    </hp>
  </fragment>
);
