import { SPEditor } from '@udecode/plate-core';
import { TablePluginOptions } from '@udecode/plate-table';
import { ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface ToolbarTableProps
  extends ToolbarButtonProps,
    TablePluginOptions {
  transform: (editor: SPEditor, options: { header?: boolean }) => void;
}
