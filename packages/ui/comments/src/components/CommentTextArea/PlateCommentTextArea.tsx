import React from 'react';
import { CommentTextArea } from './CommentTextArea';
import { commentTextAreaSelectors } from './commentTextAreaStore';
import { textAreaStyles } from './styles';
import { TextAreaProps } from './TextArea';

export const PlateCommentTextArea = (props: TextAreaProps) => {
  const areContactsShown = commentTextAreaSelectors.areContactsShown();

  return (
    <div>
      <CommentTextArea.TextArea {...props} css={textAreaStyles} />
      {/* {areContactsShown && (
        <Contacts
          contacts={filteredContacts}
          onSelected={onContactSelected}
          onClosed={onContactsClosed}
          selectedIndex={selectedContactIndex}
        />
      )} */}
    </div>
  );
};
