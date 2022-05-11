import { PlateEditor, Value } from '@udecode/plate-core';
import { TablePluginOptions } from '@udecode/plate-table';
import { ToolbarButtonProps } from '@udecode/plate-ui-toolbar';

export interface TableToolbarButtonProps<V extends Value>
  extends ToolbarButtonProps,
    TablePluginOptions {
  transform: (editor: PlateEditor<V>, options: { header?: boolean }) => void;
}
