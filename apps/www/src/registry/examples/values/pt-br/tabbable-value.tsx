/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const tabbableValue: any = (
  <fragment>
    <hh2>Tabbable (Navegação por Tab)</hh2>
    <hp>
      Garanta uma experiência de navegação por tab suave dentro do seu editor com o
      plugin Tabbable.
    </hp>
    <hp>
      Lide corretamente com ordens de tabulação para nós vazios (void nodes), permitindo navegação
      e interação contínuas. Sem este plugin, elementos DOM dentro de nós
      vazios vêm após o editor na ordem de tabulação.
    </hp>
    <element type="tabbable">
      <htext />
    </element>
    <element type="tabbable">
      <htext />
    </element>
    <hp>Coloque seu cursor aqui e tente pressionar tab ou shift+tab.</hp>
    <hp indent={1} listStyleType="disc">
      Item de lista 1
    </hp>
    <hp indent={1} listStyleType="disc">
      Item de lista 2
    </hp>
    <hp indent={1} listStyleType="disc">
      Item de lista 3
    </hp>
    <hcodeblock lang="javascript">
      <hcodeline>if (true) {'{'}</hcodeline>
      <hcodeline>
        {'// <-'} Coloque o cursor no início da linha e pressione tab
      </hcodeline>
      <hcodeline>{'}'}</hcodeline>
    </hcodeblock>
    <hp>
      Neste exemplo, o plugin está desativado quando o cursor está dentro de uma lista
      ou um bloco de código. Você pode personalizar isso usando a opção{' '}
      <htext code>query</htext>.
    </hp>
    <element type="tabbable">
      <htext />
    </element>
    <hp>
      Quando você pressiona tab no final do editor, o foco deve ir para o
      botão abaixo.
    </hp>
  </fragment>
);
