/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const pluginRulesValue: any = (
  <fragment>
    <hh2>Regras de Plugin</hh2>
    <hp>
      Regras de plugin controlam como os blocos respondem a Enter, Backspace,
      seleção e normalização.
    </hp>

    <hh3>Regras de Quebra (Break)</hh3>

    <hp>
      <htext bold>Divisão e Redefinição de Título (splitReset):</htext>{' '}
      Pressione Enter no meio do título para dividir e redefinir o novo bloco
      para parágrafo.
    </hp>
    <hh3>
      Pressione Enter após "Pressione" para ver o comportamento de splitReset
    </hh3>

    <hp>
      <htext bold>Citação em bloco com quebras de linha:</htext> Enter adiciona
      quebras de linha, Enter em linhas vazias redefine para parágrafo.
    </hp>
    <hblockquote>
      Esta citação em bloco usa regras de quebra de linha. Pressione Enter aqui
      para quebras de linha.
    </hblockquote>

    <hh3>Regras de Exclusão (Delete)</hh3>

    <hp>
      <htext bold>Redefinição de bloco de código:</htext> Backspace em bloco de
      código vazio redefine para parágrafo.
    </hp>
    <hcodeblock lang="javascript">
      <hcodeline>console.info('Olá mundo');</hcodeline>
      <hcodeline>
        <text />
      </hcodeline>
    </hcodeblock>

    <hp>
      <htext bold>Itens de lista:</htext> Backspace no início remove a
      formatação de lista.
    </hp>
    <hp indent={1} listStyleType="disc">
      Pressione Backspace no início para remover a formatação de lista
    </hp>

    <hh3>Regras de Seleção</hh3>

    <hp>
      <htext bold>Afinidade rígida (código):</htext> Use as setas ao redor de{' '}
      <htext code>marcas de código</htext> - requer dois pressionamentos de
      tecla para cruzar fronteiras.
    </hp>

    <hp>
      <htext bold>Afinidade direcional:</htext> Use as setas ao redor de texto{' '}
      <htext superscript>sobrescrito</htext> - a afinidade do cursor depende da
      direção do movimento.
    </hp>

    <hp>
      <htext bold>Link direcional:</htext> Navegue com as setas ao redor{' '}
      <ha url="https://example.com">deste link</ha> para testar o comportamento
      direcional.
    </hp>

    <hh3>Regras de Normalização</hh3>

    <hp>
      <htext bold>Remoção de link vazio:</htext> Exclua todo o texto{' '}
      <ha url="https://example.com">deste link</ha> - o elemento de link será
      removido automaticamente.
    </hp>

    <hh3>Regras de Mesclagem (Merge)</hh3>

    <hp>
      <htext bold>Elementos vazios (Void):</htext>
    </hp>
    <element type="hr" />
    <hp>
      Pressione Backspace no início - o elemento vazio é selecionado em vez de
      excluído.
    </hp>

    <hp>
      <text />
    </hp>
    <hh2>Backspace no início remove o parágrafo vazio acima</hh2>
  </fragment>
);
