import { SPEditor } from '@udecode/slate-plugins-core';
import { TablePluginOptions } from '@udecode/slate-plugins-table';
import { ToolbarButtonProps } from '@udecode/slate-plugins-toolbar';

export interface ToolbarTableProps
  extends ToolbarButtonProps,
    TablePluginOptions {
  transform: (editor: SPEditor, options: { header?: boolean }) => void;
}
