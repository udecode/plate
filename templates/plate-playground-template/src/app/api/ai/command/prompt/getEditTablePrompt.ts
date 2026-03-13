import type { ChatMessage } from '@/components/editor/use-chat';
import type { SlateEditor } from 'platejs';

import { getMarkdown } from '@platejs/ai';
import dedent from 'dedent';

import {
  buildStructuredPrompt,
  formatTextFromMessages,
  getLastUserInstruction,
} from '../utils';

export function buildEditTableMultiCellPrompt(
  editor: SlateEditor,
  messages: ChatMessage[]
): string {
  const tableCellMarkdown = getMarkdown(editor, {
    type: 'tableCellWithId',
  });

  return buildStructuredPrompt({
    context: tableCellMarkdown,
    examples: [
      // 1) Simple text edit
      dedent`
        <instruction>
        Fix grammar
        </instruction>

        <context>
        | Name | Age | City |
        | --- | --- | --- |
        | John | 28 | <CellRef id="c1" /> |

        <Cell id="c1">
        New york
        </Cell>
        </context>

        <output>
        [
          { "id": "c1", "content": "New York" }
        ]
        </output>
      `,

      // 2) Multi-cell edit
      dedent`
        <instruction>
        Translate to Chinese
        </instruction>

        <context>
        | Name | Role |
        | --- | --- |
        | Alice | <CellRef id="c1" /> |
        | Bob | <CellRef id="c2" /> |

        <Cell id="c1">
        Engineer
        </Cell>

        <Cell id="c2">
        Designer
        </Cell>
        </context>

        <output>
        [
          { "id": "c1", "content": "工程师" },
          { "id": "c2", "content": "设计师" }
        ]
        </output>
      `,

      // 3) Multi-block content in cell
      dedent`
        <instruction>
        Add more details
        </instruction>

        <context>
        | Task | Description |
        | --- | --- |
        | Setup | <CellRef id="c1" /> |

        <Cell id="c1">
        Install dependencies
        </Cell>
        </context>

        <output>
        [
          { "id": "c1", "content": "Install dependencies\n\n- Run npm install\n- Configure environment" }
        ]
        </output>
      `,
    ],
    history: formatTextFromMessages(messages),
    instruction: getLastUserInstruction(messages),
    rules: dedent`
      - The table contains <CellRef id="..." /> placeholders marking selected cells.
      - The actual content of each selected cell is in <Cell id="...">content</Cell> blocks after the table.
      - You must ONLY modify the content of the <Cell> blocks.
      - Output a JSON array where each object has "id" (the cell id) and "content" (the new content).
      - The "content" field can contain multiple paragraphs separated by \\n\\n.
      - Do NOT output any <Cell>, <CellRef>, or table markdown - only the JSON array.
      - CRITICAL: Examples are for format reference only. NEVER output content from examples.
    `,
    task: dedent`
      You are a table cell editor assistant.
      The <context> contains a markdown table with <CellRef /> placeholders and corresponding <Cell> content blocks.
      Your task is to modify the content of the selected cells according to the user's instruction.
      Output ONLY a valid JSON array with the modified cell contents.
    `,
  });
}
