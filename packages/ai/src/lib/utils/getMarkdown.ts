import { serializeMd } from '@platejs/markdown';
import { getTableGridAbove } from '@platejs/table';
import {
  type SlateEditor,
  type TElement,
  type TTableCellElement,
  type TTableElement,
  KEYS,
} from 'platejs';

import type { MarkdownType } from './replacePlaceholders';

/**
 * Serialize table cell content to markdown string. Multiple paragraphs are
 * joined with <br/>.
 */
const serializeCellContent = (
  editor: SlateEditor,
  cell: TTableCellElement
): string => {
  const parts: string[] = [];

  for (const child of cell.children) {
    const md = serializeMd(editor, { value: [child as TElement] }).trim();
    if (md) {
      parts.push(md);
    }
  }

  return parts.join('<br/>');
};

/**
 * Serialize a table with selected cells replaced by <CellRef /> placeholders.
 * Returns the table markdown and a map of cell IDs to their cells.
 */
const serializeTableWithCellRefs = (
  editor: SlateEditor,
  table: TTableElement,
  selectedCellIds: Set<string>
): {
  selectedCells: Array<{ cell: TTableCellElement; id: string }>;
  tableMarkdown: string;
} => {
  const rows: string[] = [];
  const selectedCells: Array<{ cell: TTableCellElement; id: string }> = [];
  let headerSeparator = '';

  for (let rowIdx = 0; rowIdx < table.children.length; rowIdx++) {
    const row = table.children[rowIdx];
    const cellTexts: string[] = [];

    for (const cell of row.children as TTableCellElement[]) {
      const cellId = cell.id as string | undefined;

      if (cellId && selectedCellIds.has(cellId)) {
        // Use CellRef placeholder for selected cells
        cellTexts.push(`<CellRef id="${cellId}" />`);
        // Store cell for later content serialization
        selectedCells.push({ cell, id: cellId });
      } else {
        const content = serializeCellContent(editor, cell);
        cellTexts.push(content);
      }
    }

    rows.push(`| ${cellTexts.join(' | ')} |`);

    // Add header separator after first row
    if (rowIdx === 0) {
      headerSeparator = `| ${cellTexts.map(() => '---').join(' | ')} |`;
    }
  }

  // Insert header separator after first row
  if (rows.length > 0 && headerSeparator) {
    rows.splice(1, 0, headerSeparator);
  }

  return {
    selectedCells,
    tableMarkdown: `${rows.join('\n')}\n`,
  };
};

/**
 * Serialize cell contents as separate Cell blocks. Each cell's content can
 * contain multiple blocks (paragraphs, lists, etc.) since it's outside the
 * table markdown structure.
 */
const serializeCellBlocks = (
  editor: SlateEditor,
  cells: Array<{ cell: TTableCellElement; id: string }>
): string => {
  const blocks: string[] = [];

  for (const { cell, id } of cells) {
    const content = serializeMd(editor, {
      value: cell.children as TElement[],
    }).trim();

    blocks.push(`<Cell id="${id}">\n${content}\n</Cell>`);
  }

  return blocks.join('\n\n');
};

// Internal
export const getMarkdown = (
  editor: SlateEditor,
  {
    type,
  }: {
    type: MarkdownType;
  }
) => {
  if (type === 'editor' || type === 'editorWithBlockId') {
    return serializeMd(editor, {
      withBlockId: type === 'editorWithBlockId',
    });
  }

  if (type === 'block' || type === 'blockWithBlockId') {
    const blocks = editor.api.blocks({ mode: 'lowest' }).map(([node]) => node);

    return serializeMd(editor, {
      value: blocks,
      withBlockId: type === 'blockWithBlockId',
    });
  }

  if (type === 'blockSelection' || type === 'blockSelectionWithBlockId') {
    const fragment = editor.api.fragment<TElement>();

    // Remove any block formatting
    if (fragment.length === 1) {
      const modifiedFragment = [
        {
          children: fragment[0].children,
          type: KEYS.p,
        },
      ];

      return serializeMd(editor, {
        value: modifiedFragment,
        withBlockId: type === 'blockSelectionWithBlockId',
      });
    }

    return serializeMd(editor, {
      value: fragment,
      withBlockId: type === 'blockSelectionWithBlockId',
    });
  }

  if (type === 'tableCellWithId') {
    // Get selected cells
    const cellEntries = getTableGridAbove(editor, { format: 'cell' });

    if (cellEntries.length === 0) {
      return '';
    }

    // Collect selected cell IDs
    const selectedCellIds = new Set<string>();

    for (const [cell] of cellEntries) {
      const cellId = (cell as TTableCellElement).id as string | undefined;

      if (cellId) {
        selectedCellIds.add(cellId);
      }
    }

    // Get the table containing the selection
    const tableEntry = editor.api.block({
      at: editor.selection!,
      match: { type: KEYS.table },
    });

    if (!tableEntry) {
      return '';
    }

    const table = tableEntry[0] as TTableElement;

    // Serialize table with CellRef placeholders
    const { selectedCells, tableMarkdown } = serializeTableWithCellRefs(
      editor,
      table,
      selectedCellIds
    );

    // Serialize Cell content blocks
    const cellBlocks = serializeCellBlocks(editor, selectedCells);

    // Combine: table + Cell blocks
    return `${tableMarkdown}\n${cellBlocks}`;
  }

  return '';
};
