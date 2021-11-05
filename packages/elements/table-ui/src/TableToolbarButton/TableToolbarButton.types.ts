import { PlateEditor } from '@udecode/plate-core';
import { TablePluginOptions } from '@udecode/plate-table';
import { ToolbarButtonProps } from '@udecode/plate-toolbar';

export interface TableToolbarButtonProps
  extends ToolbarButtonProps,
    TablePluginOptions {
  transform: (editor: PlateEditor, options: { header?: boolean }) => void;
}
