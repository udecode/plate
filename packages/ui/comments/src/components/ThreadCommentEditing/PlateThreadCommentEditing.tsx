import React, { RefObject } from 'react';
import { Thread, User } from '../../types';
import {
  CommentTextArea,
  commentTextAreaSelectors,
  textAreaStyles,
} from '../CommentTextArea';
import {
  contactCss,
  Contacts,
  contactsEmailCss,
  contactsImageCss,
  contactsNameCss,
  contactsRootCss,
  contactsWrapperCss,
} from '../Contacts';
import {
  threadCommentEditingActionsCss,
  threadCommentEditingCancelButtonCss,
  threadCommentEditingRootCss,
  threadCommentEditingSaveButtonCss,
} from './styles';
import { ThreadCommentEditing } from './ThreadCommentEditing';

export type PlateThreadCommentEditingProps = {
  onSave: (value: string) => void;
  onCancel: () => void;
  initialValue: string;
  fetchContacts: () => User[];
  onValueChange: (value: string) => void;
  thread: Thread;
  value: string;
  onSubmit: () => void;
  textAreaRef: RefObject<HTMLTextAreaElement> | null;
};

export const PlateThreadCommentEditing = (
  props: PlateThreadCommentEditingProps
) => {
  const areContactsShown = commentTextAreaSelectors.areContactsShown();
  const contacts = commentTextAreaSelectors.filteredContacts();

  return (
    <div css={threadCommentEditingRootCss}>
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
      <div css={threadCommentEditingActionsCss}>
        <ThreadCommentEditing.SaveButton
          {...props}
          css={threadCommentEditingSaveButtonCss}
        >
          Save
        </ThreadCommentEditing.SaveButton>
        <ThreadCommentEditing.CancelButton
          {...props}
          css={threadCommentEditingCancelButtonCss}
        >
          Cancel
        </ThreadCommentEditing.CancelButton>
      </div>
    </div>
  );
};
