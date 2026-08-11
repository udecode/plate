import type { ChatMessage } from '@/registry/components/editor/use-chat';
import type { MarkdownEditor } from '@platejs/markdown';

import {
  BaseTablePlugin,
  type TableCellElement,
  type TableElement,
} from '@platejs/table';
import { ElementApi, ElementIdPlugin } from 'platejs';
import dedent from 'dedent';

import {
  buildStructuredPrompt,
  formatTextFromMessages,
  getLastUserInstruction,
} from '../utils';

export function buildEditTableMultiCellPrompt(
  editor: MarkdownEditor,
  messages: ChatMessage[]
): string {
  const cells = editor
    .plugin(BaseTablePlugin)
    .read.getGridAbove({ format: 'cell' });
  const elementId = editor.plugin(ElementIdPlugin);
  const selectedElementIds = new Set(
    cells.map(([cell]) => elementId.read.id(cell))
  );
  const table = editor.read.nodes.block<TableElement>({
    match: { type: editor.plugin(BaseTablePlugin).schema.type },
  })?.[0];
  const selectedCells: Array<{ cell: TableCellElement; id: string }> = [];
  const rows =
    table?.children.map((row, rowIndex) => {
      const values = (row.children as TableCellElement[]).map((cell) => {
        const id = elementId.read.id(cell);

        if (selectedElementIds.has(id)) {
          selectedCells.push({ cell, id });

          return `<CellRef id="${id}" />`;
        }

        return cell.children
          .map((child) => {
            if (!ElementApi.isElement(child)) {
              throw new Error('Table cells must contain block elements.');
            }

            return editor.api.markdown
              .serialize({ value: { children: [child] } })
              .trim();
          })
          .filter(Boolean)
          .join('<br/>');
      });
      const markdown = `| ${values.join(' | ')} |`;

      return rowIndex === 0
        ? `${markdown}\n| ${values.map(() => '---').join(' | ')} |`
        : markdown;
    }) ?? [];
  const cellBlocks = selectedCells
    .map(({ cell, id }) => {
      if (!cell.children.every((node) => ElementApi.isElement(node))) {
        throw new Error('Table cells must contain block elements.');
      }

      return `<Cell id="${id}">\n${editor.api.markdown
        .serialize({ value: { children: cell.children } })
        .trim()}\n</Cell>`;
    })
    .join('\n\n');
  const tableCellMarkdown =
    rows.length === 0 ? '' : `${rows.join('\n')}\n\n${cellBlocks}`;

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
