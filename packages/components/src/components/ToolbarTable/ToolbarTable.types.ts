import { TableOptions } from '@udecode/slate-plugins';
import { Editor } from 'slate';
import { ToolbarButtonProps } from '../ToolbarButton/ToolbarButton.types';

export interface ToolbarTableProps extends ToolbarButtonProps, TableOptions {
  transform: (editor: Editor, options?: TableOptions) => void;
}
