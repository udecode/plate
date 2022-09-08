import React from 'react';
import { Contact } from '../../utils';
import { Contacts } from './Contacts';
import {
  contactCss,
  contactsEmailCss,
  contactsImageCss,
  contactsNameCss,
  contactsRootCss,
  contactsWrapperCss,
} from './styles';

export type PlateContacts = {
  contacts: Contact[];
};

export const PlateContacts = (props: PlateContacts) => {
  const { contacts } = props;

  return (
    <div css={contactsWrapperCss}>
      <div css={contactsRootCss}>
        {contacts.map((contact) => (
          <div key={contact.id} css={contactCss}>
            <Contacts.Image contact={contact} css={contactsImageCss} />
            <div>
              <Contacts.Text css={contactsNameCss}>
                {contact.name}
              </Contacts.Text>
              <Contacts.Text css={contactsEmailCss}>
                {contact.email}
              </Contacts.Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
