/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@platejs/test-utils';

jsx;

export const codeBlockValue: any = (
  <fragment>
    <hh2>Blocos de Código</hh2>
    <hp>
      Exiba seu código com destaque de sintaxe. Suporta múltiplas linguagens de
      programação com formatação e indentação adequadas.
    </hp>
    <hcodeblock lang="javascript">
      <hcodeline>// Exemplo JavaScript com async/await</hcodeline>
      <hcodeline>{'async function fetchUserData(userId) {'}</hcodeline>
      <hcodeline>{'  try {'}</hcodeline>
      <hcodeline>
        {'    const response = await fetch(`/api/users/${userId}`);'}
      </hcodeline>
      <hcodeline>{'    const userData = await response.json();'}</hcodeline>
      <hcodeline>{'    return userData;'}</hcodeline>
      <hcodeline>{'  } catch (error) {'}</hcodeline>
      <hcodeline>{`    console.error('Falha ao buscar dados do usuário:', error);`}</hcodeline>
      <hcodeline>{'    throw error;'}</hcodeline>
      <hcodeline>{'  }'}</hcodeline>
      <hcodeline>{'}'}</hcodeline>
    </hcodeblock>
    <hp>Exemplo Python com definição de classe:</hp>
    <hcodeblock lang="python">
      <hcodeline># Classe Python com dicas de tipo</hcodeline>
      <hcodeline>from typing import List, Optional</hcodeline>
      <hcodeline />
      <hcodeline>class GerenciadorTarefas:</hcodeline>
      <hcodeline>{'    def __init__(self) -> None:'}</hcodeline>
      <hcodeline>{'        self.tasks: List[str] = []'}</hcodeline>
      <hcodeline />
      <hcodeline>
        {'    def adicionar_tarefa(self, task: str) -> None:'}
      </hcodeline>
      <hcodeline>{`        """Adicionar uma nova tarefa à lista."""`}</hcodeline>
      <hcodeline>{'        self.tasks.append(task)'}</hcodeline>
      <hcodeline />
      <hcodeline>
        {'    def obter_tarefa(self, index: int) -> Optional[str]:'}
      </hcodeline>
      <hcodeline>{`        """Obter uma tarefa pelo índice, retornar None se não encontrada."""`}</hcodeline>
      <hcodeline>
        {
          '        return self.tasks[index] if 0 <= index < len(self.tasks) else None'
        }
      </hcodeline>
    </hcodeblock>
    <hp>Exemplo de estilo CSS:</hp>
    <hcodeblock lang="css">
      <hcodeline>/* CSS Moderno com propriedades personalizadas */</hcodeline>
      <hcodeline>{':root {'}</hcodeline>
      <hcodeline>{'  --primary-color: #3b82f6;'}</hcodeline>
      <hcodeline>{'  --secondary-color: #64748b;'}</hcodeline>
      <hcodeline>{'  --border-radius: 0.5rem;'}</hcodeline>
      <hcodeline>{'}'}</hcodeline>
      <hcodeline />
      <hcodeline>{'.card {'}</hcodeline>
      <hcodeline>{'  background: white;'}</hcodeline>
      <hcodeline>{'  border-radius: var(--border-radius);'}</hcodeline>
      <hcodeline>
        {'  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'}
      </hcodeline>
      <hcodeline>{'  padding: 1.5rem;'}</hcodeline>
      <hcodeline>{'  transition: transform 0.2s ease-in-out;'}</hcodeline>
      <hcodeline>{'}'}</hcodeline>
      <hcodeline />
      <hcodeline>{'.card:hover {'}</hcodeline>
      <hcodeline>{'  transform: translateY(-2px);'}</hcodeline>
      <hcodeline>{'}'}</hcodeline>
    </hcodeblock>
  </fragment>
);
