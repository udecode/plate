import React, { RefObject } from 'react';
import { Close, MoreVert } from '@styled-icons/material';
import { Comment, Contact, Thread, User } from '../../utils';
import { Avatar, avatarImageCss, avatarRootCss } from '../Avatar';
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
  MoreMenu,
  moreMenuButtonRootStyles,
  moreMenuMenuItemStyles,
  moreMenuMenuRootStyles,
  moreMenuRootStyles,
  useMoreMenuSelectors,
} from '../MoreMenu';
import {
  ReOpenThreadButton,
  reOpenThreadButtonRootStyles,
} from '../ReOpenThreadButton';
import { ResolveButton, resolveButtonRootStyles } from '../ResolveButton';
import {
  ThreadCommentEditing,
  threadCommentEditingActionsCss,
  threadCommentEditingCancelButtonCss,
  threadCommentEditingRootCss,
  threadCommentEditingSaveButtonCss,
} from '../ThreadCommentEditing';
import {
  ThreadLinkDialog,
  threadLinkDialogCloseButtonCss,
  threadLinkDialogHeaderCss,
  threadLinkDialogLinkCss,
  threadLinkDialogRootCss,
} from '../ThreadLinkDialog';
import {
  threadCommentActionsCss,
  threadCommentAuthorTimestampCss,
  threadCommentCommenterNameCss,
  threadCommentCommentHeaderCss,
  threadCommentRootCss,
  threadCommentThreadCommentTextCss,
  threadCommentTimestampCss,
} from './styles';
import { ThreadComment } from './ThreadComment';
import { useThreadCommentStoreSelectors } from './threadCommentStore';

export type PlateThreadCommentProps = {
  comment: Comment;
  fetchContacts: () => Contact[];
  initialValue: string;
  onCancel?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onLink?: () => void;
  onReOpenThread?: () => void;
  onResolveThread?: () => void;
  onSave?: (value: string) => void;
  onSubmitComment?: (value: string, assignedTo: User) => void;
  onValueChange?: (value: string) => void;
  showLinkButton?: boolean;
  showMoreButton?: boolean;
  showReOpenThreadButton?: boolean;
  showResolveThreadButton?: boolean;
  textAreaRef?: RefObject<HTMLTextAreaElement> | null;
  thread: Thread;
  value: string;
  threadLink?: string;
};

export const PlateThreadComment = (props: PlateThreadCommentProps) => {
  const {
    comment,
    showResolveThreadButton,
    showReOpenThreadButton,
    showMoreButton,
  } = props;

  const isMenuOpen = useMoreMenuSelectors().isMenuOpen();
  const isThreadLinkDialogOpen = useThreadCommentStoreSelectors().isOpen();
  const isEditing = useThreadCommentStoreSelectors().isEditing();
  const areContactsShown = commentTextAreaSelectors.areContactsShown();
  const contacts = commentTextAreaSelectors.filteredContacts();

  return (
    <div css={threadCommentRootCss}>
      <div css={threadCommentCommentHeaderCss}>
        <Avatar.Root css={avatarRootCss}>
          <ThreadComment.AvatarImage {...props} css={avatarImageCss} />
        </Avatar.Root>
        <div css={threadCommentAuthorTimestampCss}>
          <div css={threadCommentCommenterNameCss}>
            {comment.createdBy.name}
          </div>
          <div css={threadCommentTimestampCss}>
            {new Date(comment.createdAt).toLocaleString()}
          </div>
        </div>
        <div css={threadCommentActionsCss}>
          {showResolveThreadButton && (
            <ResolveButton.Root {...props} css={resolveButtonRootStyles}>
              <ResolveButton.Check />
            </ResolveButton.Root>
          )}
          {showReOpenThreadButton && (
            <ReOpenThreadButton.Root
              {...props}
              css={reOpenThreadButtonRootStyles}
            >
              <ReOpenThreadButton.Unarchive />
            </ReOpenThreadButton.Root>
          )}

          {showMoreButton ? (
            <div css={moreMenuRootStyles}>
              <MoreMenu.Button css={moreMenuButtonRootStyles}>
                <MoreVert />
              </MoreMenu.Button>
              {isMenuOpen ? (
                <MoreMenu.MenuRoot css={moreMenuMenuRootStyles}>
                  <ThreadComment.MoreMenuEditButton
                    {...props}
                    css={moreMenuMenuItemStyles}
                  >
                    Edit
                  </ThreadComment.MoreMenuEditButton>
                  <MoreMenu.DeleteButton
                    {...props}
                    css={moreMenuMenuItemStyles}
                  >
                    Delete
                  </MoreMenu.DeleteButton>
                  <MoreMenu.LinkButton {...props} css={moreMenuMenuItemStyles}>
                    Link to this thread
                  </MoreMenu.LinkButton>
                </MoreMenu.MenuRoot>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {isEditing ? (
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
            <ThreadComment.CancelButton
              {...props}
              css={threadCommentEditingCancelButtonCss}
            >
              Cancel
            </ThreadComment.CancelButton>
          </div>
        </div>
      ) : (
        <div css={threadCommentThreadCommentTextCss}>{comment.text}</div>
      )}

      {isThreadLinkDialogOpen ? (
        <div css={threadLinkDialogRootCss}>
          <div css={threadLinkDialogHeaderCss}>
            <h3>Link To Thread</h3>
            <ThreadComment.ThreadLinkDialogCloseButton
              css={threadLinkDialogCloseButtonCss}
            >
              <Close />
            </ThreadComment.ThreadLinkDialogCloseButton>
          </div>
          <div css={threadLinkDialogLinkCss}>
            <ThreadLinkDialog.Input {...props} />
            <ThreadLinkDialog.CopyIcon {...props} />
          </div>
        </div>
      ) : null}
    </div>
  );
};
