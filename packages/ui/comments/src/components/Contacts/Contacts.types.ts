import { Contact } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';

export interface ContactsStyleProps extends ContactsProps {}

export interface ContactsStyles {}

export interface ContactsProps extends StyledProps<ContactsStyles> {
  contacts: Contact[];
  onClosed: () => void;
  onSelected: (contact: Contact) => void;
  selectedIndex: number;
}
