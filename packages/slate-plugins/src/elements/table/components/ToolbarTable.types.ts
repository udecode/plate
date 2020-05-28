import { TableTypeOption } from 'elements/table/types';
import { Editor } from 'slate';
import { ToolbarButtonProps } from 'components/ToolbarButton';

export interface ToolbarTableProps extends ToolbarButtonProps, TableTypeOption {
  transform: (editor: Editor, options?: Required<TableTypeOption>) => void;
}
