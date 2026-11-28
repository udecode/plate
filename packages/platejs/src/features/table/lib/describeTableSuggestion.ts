import {
  type AuthoredChange,
  type AuthoredChangePart,
  AuthoredPlugin,
} from '../../../authored';
import {
  type Editor,
  ElementApi,
  type Path,
  PathApi,
  type Point,
} from '../../../core';
import {
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from './BaseTablePlugin';

const partPaths = (part: AuthoredChangePart): readonly Path[] =>
  part.kind === 'boundary'
    ? [part.at.path]
    : part.kind === 'content'
      ? [part.range.anchor.path, part.range.focus.path]
      : [part.path];

const formatTableChangeName = (
  kind: 'delete' | 'insert',
  noun: 'column' | 'row' | 'table',
  count: number
) =>
  `${kind === 'insert' ? 'Add' : 'Delete'} ${
    count === 1 ? noun : `${count} ${noun}s`
  }`;

/**
 * Describe a single pending authored change when it is a pure structural table
 * edit (whole table, whole rows, or whole columns without spanning cells).
 * Returns `null` when the table plugin is not installed or the change touches
 * non-structural content.
 */
export const describeTableSuggestion = (
  editor: Editor,
  { id: changeId, ranges }: AuthoredChange
): string | null => {
  const table = editor.plugin(BaseTablePlugin);
  const viewRoot = editor.read.view.root();
  const inView = ({ root }: Point) => root === viewRoot;

  const authored = editor.plugin(AuthoredPlugin);

  if (
    !table.installed ||
    !authored.installed ||
    !ranges.every(({ anchor, focus }) => inView(anchor) && inView(focus))
  ) {
    return null;
  }

  const path = ranges[0]?.anchor.path ?? [];
  const tables = path.flatMap((_, index) => {
    const tablePath = path.slice(0, index + 1);
    const node = editor.read.nodes.get(tablePath)?.[0];

    return ElementApi.isElement(node) && node.type === table.schema.type
      ? [{ node, tablePath }]
      : [];
  });
  const { read } = authored;
  const details = tables.length > 0 ? read.details(changeId) : null;

  if (!details) return null;

  const rowType = editor.plugin(BaseTableRowPlugin).schema.type;
  const cellType = editor.plugin(BaseTableCellPlugin).schema.type;
  const kindOf = (node: unknown) =>
    read
      .reviewOf(node)
      .marks.flatMap((mark) =>
        mark.change === changeId &&
        (mark.kind === 'delete' || mark.kind === 'insert')
          ? [mark.kind]
          : []
      )[0] ?? null;
  const markedAt = (depth: number) => {
    const node =
      path.length >= depth
        ? editor.read.nodes.get(path.slice(0, depth))?.[0]
        : undefined;

    return node ? kindOf(node) : null;
  };
  const covers = (tablePath: Path, members: readonly Path[], column = false) =>
    details.parts.every((part) =>
      part.kind === 'properties' && PathApi.equals(part.path, tablePath)
        ? column &&
          Object.keys({ ...part.before, ...part.after }).every(
            (key) => key === 'columnWidths'
          )
        : partPaths(part).every((partPath) =>
            members.some((member) => PathApi.isCommon(member, partPath))
          )
    );

  for (const { node, tablePath } of tables) {
    const tableKind = kindOf(node);

    // A column change's width write on the table can be its first range.
    if (
      !read.reviewOf(node).marks.some((mark) => mark.change === changeId) &&
      !markedAt(tablePath.length + 1) &&
      !markedAt(tablePath.length + 2)
    ) {
      continue;
    }
    if (tableKind) {
      return covers(tablePath, [tablePath])
        ? formatTableChangeName(tableKind, 'table', 1)
        : null;
    }

    const rows = node.children.flatMap((row, index) =>
      ElementApi.isElement(row) && row.type === rowType
        ? [{ path: [...tablePath, index], row }]
        : []
    );

    if (
      rows.some(({ row }) =>
        row.children.some(
          (cell) =>
            ElementApi.isElement(cell) &&
            [cell.colSpan, cell.rowSpan].some(
              (span) => typeof span === 'number' && span > 1
            )
        )
      )
    ) {
      return null;
    }

    const markedRows = rows.flatMap((entry) => {
      const kind = kindOf(entry.row);

      return kind ? [{ kind, path: entry.path }] : [];
    });

    if (markedRows.length > 0) {
      const { kind } = markedRows[0];

      return markedRows.every((row) => row.kind === kind) &&
        covers(
          tablePath,
          markedRows.map((row) => row.path)
        )
        ? formatTableChangeName(kind, 'row', markedRows.length)
        : null;
    }

    const markedCells = rows.map((entry) =>
      entry.row.children.flatMap((cell, index) => {
        const kind =
          ElementApi.isElement(cell) && cell.type === cellType
            ? kindOf(cell)
            : null;

        return kind ? [{ index, kind, path: [...entry.path, index] }] : [];
      })
    );
    const cells = markedCells.flat();

    if (cells.length === 0) continue;

    const { kind } = cells[0];
    const columns = markedCells[0].map((cell) => cell.index);
    const wholeColumns = markedCells.every(
      (rowCells) =>
        rowCells.length === columns.length &&
        rowCells.every((cell, index) => cell.index === columns[index])
    );

    return wholeColumns &&
      cells.every((cell) => cell.kind === kind) &&
      covers(
        tablePath,
        cells.map((cell) => cell.path),
        true
      )
      ? formatTableChangeName(kind, 'column', columns.length)
      : null;
  }

  return null;
};

/**
 * Describe a review card when every pending change in the card is a pure
 * structural table edit, returning at most `limit` descriptions when provided.
 */
export const describeTableSuggestionGroup = (
  editor: Editor,
  groupId: string,
  options?: Readonly<{
    limit?: number;
  }>
): readonly string[] | null => {
  const table = editor.plugin(BaseTablePlugin);
  const authored = editor.plugin(AuthoredPlugin);

  if (!table.installed || !authored.installed) return null;

  const limit = options?.limit;
  const first = authored.read.changes({ group: groupId, limit: 1 }).items[0];

  if (!first || describeTableSuggestion(editor, first) === null) return null;

  const fullChanges = authored.read.groupDetails(groupId)?.changes ?? [];

  if (fullChanges.length === 0) return null;

  const names: string[] = [];

  for (const change of fullChanges) {
    const name = describeTableSuggestion(editor, change);

    if (name === null) return null;
    if (limit === undefined || names.length < limit) names.push(name);
  }

  return names;
};
