import { TablePluginOptions } from '@udecode/slate-plugins-table';
import { ToolbarButtonProps } from '@udecode/slate-plugins-toolbar';
import { Editor } from 'slate';

export interface ToolbarTableProps
  extends ToolbarButtonProps,
    TablePluginOptions {
  transform: (editor: Editor, pluginOptions: { header?: boolean }) => void;
}
