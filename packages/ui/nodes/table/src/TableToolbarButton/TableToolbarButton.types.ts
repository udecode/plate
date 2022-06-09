import { PlateEditor, Value } from '@udecode/plate-core';
import { ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface TableToolbarButtonProps<V extends Value>
  extends ToolbarButtonProps {
  header?: boolean;
  transform: (editor: PlateEditor<V>, options: { header?: boolean }) => void;
}
