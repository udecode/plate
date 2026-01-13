import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';

import {
  TableCellElementStaticDocx,
  TableCellHeaderElementStaticDocx,
  TableElementStaticDocx,
  TableRowElementStaticDocx,
} from '@/registry/ui/table-node-static-docx';

/**
 * Table kit for DOCX export.
 * Uses standard HTML/CSS borders instead of pseudo-elements for proper DOCX compatibility.
 */
export const DocxTableKit = [
  BaseTablePlugin.withComponent(TableElementStaticDocx),
  BaseTableRowPlugin.withComponent(TableRowElementStaticDocx),
  BaseTableCellPlugin.withComponent(TableCellElementStaticDocx),
  BaseTableCellHeaderPlugin.withComponent(TableCellHeaderElementStaticDocx),
];
