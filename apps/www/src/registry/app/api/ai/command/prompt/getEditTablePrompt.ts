import type { AIChatRequestRefs } from '@platejs/ai';
import type { MarkdownEditor } from '@platejs/markdown';
import { BaseTablePlugin, type TableCellElement } from '@platejs/table';
import dedent from 'dedent';
import { ElementApi } from 'platejs';

import type { ChatMessage } from '@/registry/components/editor/use-chat';

import {
  buildStructuredPrompt,
  formatTextFromMessages,
  getLastUserInstruction,
} from '../utils';

const tableCellRefPattern = /^c[1-9]\d*$/;

export function buildEditTableMultiCellPrompt(
  editor: MarkdownEditor,
  messages: ChatMessage[],
  refs: AIChatRequestRefs['tableCells']
): string {
  const tableEntry = editor.read.nodes.block({
    type: BaseTablePlugin,
  });
  const table = tableEntry?.[0];
  const tablePath = tableEntry?.[1];
  const refsByPath = new Map(
    refs.map(({ path, ref }) => {
      if (!tableCellRefPattern.test(ref)) {
        throw new Error(`Invalid AI table-cell reference: ${ref}`);
      }

      return [path.join(','), ref] as const;
    })
  );
  const selectedCells: Array<{ cell: TableCellElement; ref: string }> = [];
  const rows =
    table?.children.map((row, rowIndex) => {
      const values = (row.children as TableCellElement[]).map(
        (cell, cellIndex) => {
          const ref = tablePath
            ? refsByPath.get([...tablePath, rowIndex, cellIndex].join(','))
            : undefined;

          if (ref) {
            selectedCells.push({ cell, ref });

            return `<CellRef ref="${ref}" />`;
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
        }
      );
      const markdown = `| ${values.join(' | ')} |`;

      return rowIndex === 0
        ? `${markdown}\n| ${values.map(() => '---').join(' | ')} |`
        : markdown;
    }) ?? [];
  const cellBlocks = selectedCells
    .map(({ cell, ref }) => {
      if (!cell.children.every((node) => ElementApi.isElement(node))) {
        throw new Error('Table cells must contain block elements.');
      }

      return `<Cell ref="${ref}">\n${editor.api.markdown
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
        | John | 28 | <CellRef ref="c1" /> |

        <Cell ref="c1">
        New york
        </Cell>
        </context>

        <output>
        [
          { "ref": "c1", "content": "New York" }
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
        | Alice | <CellRef ref="c1" /> |
        | Bob | <CellRef ref="c2" /> |

        <Cell ref="c1">
        Engineer
        </Cell>

        <Cell ref="c2">
        Designer
        </Cell>
        </context>

        <output>
        [
          { "ref": "c1", "content": "工程师" },
          { "ref": "c2", "content": "设计师" }
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
        | Setup | <CellRef ref="c1" /> |

        <Cell ref="c1">
        Install dependencies
        </Cell>
        </context>

        <output>
        [
          { "ref": "c1", "content": "Install dependencies\n\n- Run npm install\n- Configure environment" }
        ]
        </output>
      `,
    ],
    history: formatTextFromMessages(messages),
    instruction: getLastUserInstruction(messages),
    rules: dedent`
      - The table contains <CellRef ref="..." /> placeholders marking selected cells.
      - The actual content of each selected cell is in <Cell ref="...">content</Cell> blocks after the table.
      - You must ONLY modify the content of the <Cell> blocks.
      - Output a JSON array where each object has "ref" (the request-local cell reference) and "content" (the new content).
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
