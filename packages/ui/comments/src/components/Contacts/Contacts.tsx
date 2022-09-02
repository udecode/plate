import '@material/list/dist/mdc.list.css';
import '@material/menu/dist/mdc.menu.css';
import React from 'react';
import { ContactsStyleProps } from './Contacts.types';
import { useContacts } from './useContacts';

export const Contacts = (props: ContactsStyleProps) => {
  const { contactsRef, contacts, selectedIndex } = useContacts(props);

  return (
    <div ref={contactsRef} className="mdc-menu mdc-menu-surface">
      <ul
        className="mdc-list mdc-menu__selection-group"
        role="menu"
        aria-hidden="true"
        aria-orientation="vertical"
        tabIndex={-1}
      >
        {contacts.map(({ id, name, email, avatarUrl }, index) => (
          <li
            key={id}
            className={`mdc-list-item mdc-list-item--with-two-lines mdc-list-item--with-leading-avatar${
              index === selectedIndex ? ' mdc-list-item--selected' : ''
            }`}
            tabIndex={index === selectedIndex ? 0 : -1}
          >
            <span className="mdc-list-item__ripple" />
            <span className="mdc-list-item__start">
              <img
                src={avatarUrl}
                alt="Avatar"
                width={40}
                height={40}
                style={{ borderRadius: '50%' }}
              />
            </span>
            <span className="mdc-list-item__content">
              <span className="mdc-list-item__primary-text">{name}</span>
              <span className="mdc-list-item__secondary-text">{email}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
