import { TablePluginOptions } from '@udecode/slate-plugins-table';
import { Editor } from 'slate';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface ToolbarTableProps
  extends ToolbarButtonProps,
    TablePluginOptions {
  transform: (editor: Editor, pluginOptions: { header?: boolean }) => void;
}
