/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

const today = new Date().toISOString().split('T')[0];

export const dateValue: any = (
  <fragment>
    <hh2>Data</hh2>
    <hp>
      Insira e exiba datas em seu texto usando elementos de data inline.
      Essas datas podem ser facilmente selecionadas e modificadas usando uma interface
      de calendário.
    </hp>
    <hp>
      Tente selecionar{' '}
      <hdate date="2024-01-01">
        <htext />
      </hdate>{' '}
      ou{' '}
      <hdate date={today}>
        <htext />
      </hdate>
      .
    </hp>
  </fragment>
);
