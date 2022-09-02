import { ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { OnAddThread } from '../../types';

export interface AddThreadToolbarButtonProps extends ToolbarButtonProps {
  onAddThread: OnAddThread;
}
