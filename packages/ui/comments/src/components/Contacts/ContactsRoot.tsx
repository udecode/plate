import { useCallback, useEffect, useRef } from 'react';
import { Corner, DefaultFocusState, MDCMenu } from '@material/menu';
import { User } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ContactsRootProps = {
  contacts: User[];
  onSelected: (contact: User) => void;
  onClosed: () => void;
  selectedIndex: number;
} & HTMLPropsAs<'div'>;

let contactsMenu: MDCMenu | null = null;

export const useContactsRoot = (
  props: ContactsRootProps
): HTMLPropsAs<'div'> => {
  const { onClosed, contacts, onSelected } = props;

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

  return { ...props, ref: contactsRef };
};

export const ContactsRoot = createComponentAs<ContactsRootProps>((props) => {
  const htmlProps = useContactsRoot(props);
  return createElementAs('div', htmlProps);
});
