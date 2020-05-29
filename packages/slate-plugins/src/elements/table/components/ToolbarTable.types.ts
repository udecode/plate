import { Editor } from 'slate';
import { ToolbarButtonProps } from '../../../components/ToolbarButton';
import { TableTypeOption } from '../types';

export interface ToolbarTableProps extends ToolbarButtonProps, TableTypeOption {
  transform: (editor: Editor, options?: Required<TableTypeOption>) => void;
}
