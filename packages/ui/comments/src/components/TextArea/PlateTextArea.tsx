import React, { ForwardedRef, useCallback, useEffect, useRef } from 'react';
import composeRefs from '@seznam/compose-react-refs';
import { Thread as ThreadType, User } from '../../types';
import { emailRegexExpression, nameRegexExpression } from '../../utils';
import { PlateContacts } from '../Contacts/PlateContacts';
import { textAreaCss } from './styles';
import { TextArea } from './TextArea';
import {
  threadTextAreaActions,
  threadTextAreaSelectors,
} from './threadTextAreaStore';

type PlateTextAreaProps = {
  value: string;
  onValueChange: (newValue: string) => void;
  thread: ThreadType;
  fetchContacts: () => User[];
  haveContactsBeenClosed: boolean;
  setHaveContactsBeenClosed: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: () => void;
};

export const PlateTextArea = React.forwardRef<
  HTMLTextAreaElement,
  PlateTextAreaProps
>((props: PlateTextAreaProps, ref: ForwardedRef<HTMLTextAreaElement>) => {
  const { setHaveContactsBeenClosed, onValueChange, value } = props;
  const areContactsShown = threadTextAreaSelectors.areContactsShown();
  const filteredContacts = threadTextAreaSelectors.filteredContacts();
  const selectedContactIndex = threadTextAreaSelectors.selectedContactIndex();

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const retrieveMentionStringAtCaretPosition = useCallback(() => {
    const textArea = textAreaRef.current;

    if (textArea) {
      const isMentionStringNextToCaret = function isMentionStringNextToCaret(
        indexOfLastCharacterOfMentionString: number
      ): boolean {
        return (
          indexOfLastCharacterOfMentionString > textArea.selectionStart ||
          textArea.selectionStart - indexOfLastCharacterOfMentionString === 1
        );
      };

      if (textArea) {
        const mentionStringStartIndex = value
          .substr(0, textArea.selectionStart)
          .lastIndexOf('@');
        if (mentionStringStartIndex !== -1) {
          const value2 = value.substr(mentionStringStartIndex);
          const emailRegExpMatch = emailRegexExpression.exec(value2);
          const nameRegExpMatch = nameRegexExpression.exec(value2);
          let match: RegExpExecArray | null;
          if (
            (emailRegExpMatch && !nameRegExpMatch) ||
            (emailRegExpMatch &&
              nameRegExpMatch &&
              emailRegExpMatch[0].length >= nameRegExpMatch[0].length)
          ) {
            match = emailRegExpMatch;
          } else if (
            (nameRegExpMatch && !emailRegExpMatch) ||
            (emailRegExpMatch &&
              nameRegExpMatch &&
              nameRegExpMatch[0].length > emailRegExpMatch[0].length)
          ) {
            match = nameRegExpMatch;
          } else {
            match = null;
          }
          if (match) {
            const indexOfLastCharacterOfMentionString =
              mentionStringStartIndex + match.index + match[0].length - 1;
            if (
              isMentionStringNextToCaret(indexOfLastCharacterOfMentionString)
            ) {
              const mentionString = match[0].trimEnd();
              const mentionStringEndIndex =
                mentionStringStartIndex + mentionString.length;
              return {
                string: mentionString,
                startIndex: mentionStringStartIndex,
                endIndex: mentionStringEndIndex,
              };
            }
          }
        }
      }
    }

    return null;
  }, [value]);

  const insertMention = useCallback(
    (mentionedContact: User) => {
      const mentionString = retrieveMentionStringAtCaretPosition();
      if (mentionString) {
        const textArea = textAreaRef.current!;
        const mentionInsertString = `@${mentionedContact.email} `;
        const newValue = `${value.substr(
          0,
          mentionString.startIndex
        )}${mentionInsertString}${value.substr(mentionString.endIndex + 1)}`;
        onValueChange(newValue);
        const selectionIndex =
          mentionString.startIndex + mentionInsertString.length;
        textArea.focus();
        textArea.setSelectionRange(selectionIndex, selectionIndex);
      }
    },
    [onValueChange, retrieveMentionStringAtCaretPosition, value]
  );

  const onContactSelected = useCallback(
    function onContactSelected(selectedContact: User) {
      threadTextAreaActions.areContactsShown(false);
      threadTextAreaActions.selectedContactIndex(0);
      insertMention(selectedContact);
    },
    [insertMention]
  );

  const onContactsClosed = useCallback(
    function onContactsClosed() {
      setHaveContactsBeenClosed(true);
    },
    [setHaveContactsBeenClosed]
  );

  useEffect(
    function focusOnShowWhenNewThread() {
      setTimeout(() => {
        const textArea = textAreaRef.current;
        if (textArea) {
          textArea.focus();
        }
      }, 0);
    },
    [textAreaRef]
  );

  return (
    <div className="mdc-menu-surface--anchor">
      <TextArea.Input
        {...props}
        ref={composeRefs(textAreaRef, ref)}
        css={textAreaCss}
        retrieveMentionStringAtCaretPosition={
          retrieveMentionStringAtCaretPosition
        }
        onContactSelected={onContactSelected}
      />
      {areContactsShown && (
        <PlateContacts
          contacts={filteredContacts}
          onSelected={onContactSelected}
          onClosed={onContactsClosed}
          selectedIndex={selectedContactIndex}
        />
      )}
    </div>
  );
});
