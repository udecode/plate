import { ToolbarButtonProps } from '@udecode/plate-ui-toolbar';
import { FetchContacts, RetrieveUser } from '../../types';

export interface ShowResolvedThreadsButtonProps extends ToolbarButtonProps {
  fetchContacts: FetchContacts;
  retrieveUser: RetrieveUser;
  renderContainer: HTMLElement;
}
