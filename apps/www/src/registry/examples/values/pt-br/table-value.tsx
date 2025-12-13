/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const createTable = (spanning?: boolean): any => (
  <fragment>
    <htable colSizes={[100, 100, 100, 100]} marginLeft={20}>
      {spanning ? (
        <htr>
          <hth colSpan={4}>
            <hp>
              <htext bold>Plugin</htext>
            </hp>
          </hth>
        </htr>
      ) : (
        <htr>
          <hth>
            <hp>
              <htext bold>Plugin</htext>
            </hp>
          </hth>
          <hth>
            <hp>
              <htext bold>Elemento</htext>
            </hp>
          </hth>
          <hth>
            <hp>
              <htext bold>Inline</htext>
            </hp>
          </hth>
          <hth>
            <hp>
              <htext bold>Void</htext>
            </hp>
          </hth>
        </htr>
      )}

      <htr>
        <htd>
          <hp>
            <htext bold>Título</htext>
          </hp>
        </htd>
        <htd>
          <hp>
            <htext />
          </hp>
        </htd>
        <htd>
          <hp>
            <htext />
          </hp>
        </htd>
        <htd>
          <hp>Não</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>Imagem</htext>
          </hp>
        </htd>
        <htd>
          <hp>Sim</hp>
        </htd>
        <htd>
          <hp>Não</hp>
        </htd>
        <htd>
          <hp>Sim</hp>
        </htd>
      </htr>
      <htr>
        <htd>
          <hp>
            <htext bold>Menção</htext>
          </hp>
        </htd>
        <htd>
          <hp>Sim</hp>
        </htd>
        <htd>
          <hp>Sim</hp>
        </htd>
        <htd>
          <hp>Sim</hp>
        </htd>
      </htr>
    </htable>
  </fragment>
);

export const tableValue: any = (
  <fragment>
    <hh2>Tabela</hh2>
    <hp>
      Crie tabelas personalizáveis com colunas e linhas redimensionáveis,
      permitindo que você projete layouts estruturados.
    </hp>
    {createTable()}
  </fragment>
);

export const tableMergeValue: any = (
  <fragment>
    <hh3>Mesclagem de Tabela</hh3>
    <hp>
      Você pode desativar a mesclagem usando a opção{' '}
      <htext code>disableMerge: true</htext>. Experimente:
    </hp>
    {createTable(true)}
  </fragment>
);
