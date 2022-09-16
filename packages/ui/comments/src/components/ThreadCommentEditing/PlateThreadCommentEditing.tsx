import React, { RefObject, useCallback, useState } from 'react';
import { Comment, Thread, User } from '../../types';
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
  onSave?: (comment: Comment) => Thread;
  onCancel?: () => void;
  initialValue: string;
  fetchContacts: () => User[];
  onValueChange?: (value: string) => void;
  thread: Thread;
  onSubmit?: () => void;
  textAreaRef?: RefObject<HTMLTextAreaElement> | null;
  comment: Comment;
};

export const PlateThreadCommentEditing = (
  props: PlateThreadCommentEditingProps
) => {
  const areContactsShown = commentTextAreaSelectors.areContactsShown();
  const contacts = commentTextAreaSelectors.filteredContacts();

  const [value, setValue] = useState('');

  const onValueChange = useCallback((val: string) => {
    setValue(val);
  }, []);

  return (
    <div css={threadCommentEditingRootCss}>
      <CommentTextArea.TextArea
        {...props}
        css={textAreaStyles}
        onValueChange={onValueChange}
      />
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
          value={value}
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
