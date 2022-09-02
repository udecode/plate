import { useCallback, useEffect, useRef } from 'react';
import { Corner, DefaultFocusState, MDCMenu } from '@material/menu';
import { ContactsStyleProps } from './Contacts.types';

let contactsMenu: MDCMenu;
export const useContacts = (props: ContactsStyleProps) => {
  const { contacts, selectedIndex, onSelected, onClosed } = props;

  const contactsRef = useRef<HTMLDivElement>(null);

  const onMenuSelected = useCallback(
    (event: CustomEvent) => {
      const selectedContactIndex = event.detail.index;
      const selectedContact = contacts[selectedContactIndex];
      onSelected(selectedContact);
    },
    [contacts, onSelected]
  );

  useEffect(() => {
    contactsMenu = new MDCMenu(contactsRef.current!);
    contactsMenu.setDefaultFocusState(DefaultFocusState.NONE);
    contactsMenu.setAnchorCorner(Corner.BOTTOM_START);
    contactsMenu.listen('MDCMenu:selected', onMenuSelected);
    contactsMenu.listen('MDCMenuSurface:closed', onClosed);
    contactsMenu.open = true;
    return () => {
      contactsMenu!.unlisten('MDCMenu:selected', onMenuSelected);
      contactsMenu!.unlisten('MDCMenuSurface:closed', onClosed);
      contactsMenu!.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { contactsRef, contacts, selectedIndex } as const;
};
