/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';
import { KEYS } from 'platejs';

jsx;

export const basicBlocksValue: any = (
  <fragment>
    <hh1>Título 1</hh1>
    <hp>
      Este é um título de nível superior, geralmente usado para títulos principais e cabeçalhos de
      seções maiores.
    </hp>
    <hh2>Título 2</hh2>
    <hp>
      Títulos secundários ajudam a organizar o conteúdo em seções e subseções claras.
    </hp>
    <hh3>Título 3</hh3>
    <hp>
      Títulos de terceiro nível fornecem mais estrutura e hierarquia ao conteúdo.
    </hp>
    <hblockquote>
      "Citações em bloco são perfeitas para destacar informações importantes, citações
      de fontes externas ou enfatizar pontos-chave no seu conteúdo."
    </hblockquote>
    <hp>
      Use títulos para criar uma estrutura de documento clara que ajude os leitores
      a navegar pelo seu conteúdo de forma eficaz. Combine-os com citações em bloco para
      enfatizar informações importantes.
    </hp>
    <element type={KEYS.hr}>
      <htext />
    </element>
    <hp>
      Linhas horizontais ajudam a separar visualmente diferentes seções do seu
      conteúdo, criando pausas claras entre tópicos ou ideias.
    </hp>
  </fragment>
);
