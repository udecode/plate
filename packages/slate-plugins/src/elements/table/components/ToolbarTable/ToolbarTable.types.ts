import { Editor } from 'slate';
import { ToolbarButtonProps } from '../../../../components/ToolbarButton/ToolbarButton.types';
import { TableOptions } from '../../types';

export interface ToolbarTableProps extends ToolbarButtonProps, TableOptions {
  transform: (editor: Editor, options?: TableOptions) => void;
}
