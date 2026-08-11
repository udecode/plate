import { defineBasePlugin } from '@platejs/core';
import {
  type Descendant,
  type EditorDocumentValue,
  TextApi,
  type Value,
} from '@platejs/plite';

import { BaseTableCellPlugin } from '../lib/BaseTablePlugin';

const LEGACY_TABLE_CELL_HEADER_TYPE = 'tableCellHeader';

const migrateTableCellHeader = (
  node: Descendant,
  cellType: string
): Descendant => {
  if (TextApi.isText(node)) return node;

  let changed = false;
  const children = node.children.map((child) => {
    const migrated = migrateTableCellHeader(child, cellType);

    if (migrated !== child) changed = true;

    return migrated;
  });

  if (node.type === LEGACY_TABLE_CELL_HEADER_TYPE) {
    return {
      ...node,
      children,
      header: true,
      type: cellType,
    };
  }

  return changed ? { ...node, children } : node;
};

const migrateChildren = (children: Value, cellType: string): Value => {
  let changed = false;
  const next = children.map((child) => {
    const migrated = migrateTableCellHeader(child, cellType);

    if (migrated !== child) changed = true;

    return migrated;
  }) as Value;

  return changed ? next : children;
};

const migrateDocument = (
  value: EditorDocumentValue,
  cellType: string
): EditorDocumentValue => {
  const children = migrateChildren(value.children, cellType);
  let roots = value.roots;

  if (roots) {
    let changed = false;
    const next = Object.fromEntries(
      Object.entries(roots).map(([name, root]) => {
        const migrated = migrateChildren(root, cellType);

        if (migrated !== root) changed = true;

        return [name, migrated];
      })
    );

    if (changed) roots = next;
  }

  if (children === value.children && roots === value.roots) return value;

  return {
    ...value,
    children,
    ...(roots ? { roots } : {}),
  };
};

/** Converts legacy header-cell nodes into canonical table cells. */
export const TableV54MigrationPlugin = defineBasePlugin('tableV54Migration', {
  transformInitialValue: ({ editor, value }) =>
    migrateDocument(value, editor.plugin(BaseTableCellPlugin).schema.type),
});
