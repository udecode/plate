/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const autoformatValue: any = (
  <fragment>
    <hh2>Formatação Automática</hh2>
    <hp>
      Potencialize sua experiência de escrita habilitando recursos de formatação automática. Adicione
      atalhos estilo Markdown que aplicam formatação automaticamente enquanto você digita.
    </hp>
    <hp>Enquanto digita, experimente estas regras de marcação:</hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>**</htext> ou <htext code>__</htext> em ambos os lados do
      seu texto para adicionar **negrito*.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>*</htext> ou <htext code>_</htext> em ambos os lados do
      seu texto para adicionar *itálico.
    </hp>

    <hp indent={1} listStyleType="disc">
      Digite <htext code>`</htext> em ambos os lados do seu texto para adicionar `código
      inline.
    </hp>

    <hp indent={1} listStyleType="disc">
      Digite <htext code>~~</htext> em ambos os lados do seu texto para adicionar
      ~~tachado~.
    </hp>
    <hp indent={1} listStyleType="disc">
      Note que nada acontece quando há um caractere antes, tente em:*negrito
    </hp>
    <hp indent={1} listStyleType="disc">
      Nós até suportamos aspas inteligentes, tente digitar{' '}
      <htext code>"olá" 'mundo'</htext>.
    </hp>

    <hp>
      No início de qualquer novo bloco ou bloco existente, tente estes (regras de
      bloco):
    </hp>

    <hp indent={1} listStyleType="disc">
      Digite <htext code>*</htext>, <htext code>-</htext> ou <htext code>+</htext>
      seguido de <htext code>espaço</htext> para criar uma lista com marcadores.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>1.</htext> ou <htext code>1)</htext> seguido de{' '}
      <htext code>espaço</htext>
      para criar uma lista numerada.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>[]</htext> ou <htext code>[x]</htext>
      seguido de <htext code>espaço</htext> para criar uma lista de tarefas.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>&gt;</htext> seguido de <htext code>espaço</htext> para
      criar uma citação em bloco.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>```</htext> para criar um bloco de código.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>---</htext> para criar uma linha horizontal.
    </hp>

    <hp indent={1} listStyleType="disc">
      Digite <htext code>#</htext> seguido de <htext code>espaço</htext> para criar
      um título H1.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>###</htext> seguido de <htext code>espaço</htext> para
      criar um subtítulo H3.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>####</htext> seguido de <htext code>espaço</htext> para
      criar um subtítulo H4.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>#####</htext> seguido de <htext code>espaço</htext> para
      criar um subtítulo H5.
    </hp>
    <hp indent={1} listStyleType="disc">
      Digite <htext code>######</htext> seguido de <htext code>espaço</htext> para
      criar um subtítulo H6.
    </hp>
  </fragment>
);
