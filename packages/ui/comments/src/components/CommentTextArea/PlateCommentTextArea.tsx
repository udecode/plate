import React, { RefObject } from 'react';
import { Thread, User } from '../../types';
import {
  contactCss,
  Contacts,
  contactsEmailCss,
  contactsImageCss,
  contactsNameCss,
  contactsRootCss,
  contactsWrapperCss,
} from '../Contacts';
import { CommentTextArea } from './CommentTextArea';
import { commentTextAreaSelectors } from './commentTextAreaStore';
import { textAreaStyles } from './styles';

export type PlateCommentTextAreaProps = {
  fetchContacts: () => User[];
  onValueChange?: (value: string) => void;
  onSubmitComment?: (value: string, assignedTo: User) => void;
  textAreaRef?: RefObject<HTMLTextAreaElement> | null;
  thread: Thread;
};

export const PlateCommentTextArea = (props: PlateCommentTextAreaProps) => {
  const areContactsShown = commentTextAreaSelectors.areContactsShown();
  const contacts = commentTextAreaSelectors.filteredContacts();

  return (
    <div>
      <CommentTextArea.TextArea {...props} css={textAreaStyles} />
      {areContactsShown ? (
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
      ) : null}
    </div>
  );
};
