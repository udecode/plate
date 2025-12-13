/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

import { createTable } from './table-value';

jsx;

export const trailingBlockValue: any = (
  <fragment>
    <hh2>Bloco Final</hh2>
    <hp>Sempre tenha um parágrafo final no fim do seu editor.</hp>
  </fragment>
);

export const exitBreakValue: any = (
  <fragment>
    <hh2>Quebra de Saída</hh2>
    <hp>
      Saia de estruturas de blocos aninhados usando atalhos de teclado. O plugin
      determina automaticamente o ponto de saída apropriado:
    </hp>

    <hp indent={1} listStyleType="disc">
      ⌘⏎ – Sair e inserir um novo bloco após a estrutura atual
    </hp>
    <hp indent={1} listStyleType="disc">
      ⌘⇧⏎ – Sair e inserir um novo bloco antes da estrutura atual
    </hp>
    <hp indent={1} listStyleType="disc">
      Automático – Encontra o ancestral mais próximo que permite irmãos de
      parágrafo
    </hp>

    <hp>
      Quebras de saída funcionam de forma inteligente em estruturas aninhadas
      como tabelas:
    </hp>
    <hcolumngroup layout={[50, 50]}>
      <hcolumn width="50%">{createTable()}</hcolumn>
      <hcolumn width="50%">
        <hcodeblock>
          <hcodeline>Tente ⌘⏎ para sair deste bloco de código.</hcodeline>
        </hcodeblock>
      </hcolumn>
    </hcolumngroup>
  </fragment>
);
