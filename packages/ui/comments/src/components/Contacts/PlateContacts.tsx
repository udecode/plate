// import '@material/list/dist/mdc.list.css';
// import '@material/menu/dist/mdc.menu.css';
import React from 'react';
import { User } from '@udecode/plate-comments';
import { Avatar } from '../Avatar';
import { Contacts } from './Contacts';
import { contactAvatarImageCss } from './styles';

type PlateContactsProps = {
  contacts: User[];
  onSelected: (contact: User) => void;
  onClosed: () => void;
  selectedIndex: number;
};

export const PlateContacts = (props: PlateContactsProps) => {
  const { contacts, selectedIndex } = props;

  return (
    <Contacts.Root {...props} className="mdc-menu mdc-menu-surface">
      <ul
        className="mdc-list mdc-menu__selection-group"
        role="menu"
        aria-hidden="true"
        aria-orientation="vertical"
        tabIndex={-1}
      >
        {contacts.map((contact, index) => (
          <li
            key={contact.id}
            className={`mdc-list-item mdc-list-item--with-two-lines mdc-list-item--with-leading-avatar${
              index === selectedIndex ? ' mdc-list-item--selected' : ''
            }`}
            tabIndex={index === selectedIndex ? 0 : -1}
          >
            <span className="mdc-list-item__ripple" />
            <span className="mdc-list-item__start">
              <Avatar.Image user={contact} css={contactAvatarImageCss} />
            </span>
            <span className="mdc-list-item__content">
              <span className="mdc-list-item__primary-text">
                {contact.name}
              </span>
              <span className="mdc-list-item__secondary-text">
                {contact.email}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Contacts.Root>
  );
};
