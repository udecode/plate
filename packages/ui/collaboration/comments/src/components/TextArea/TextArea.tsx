import React, {
  ForwardedRef,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import composeRefs from '@seznam/compose-react-refs';
import {
  Contact,
  doesContactMatchString,
  Thread as ThreadModel,
} from '@xolvio/plate-comments';
import { FetchContacts } from '../../types';
import { Contacts } from '../Contacts/Contacts';
import { createTextAreaStyles } from '../Thread/Thread.styles';

type OnChange = (newValue: string) => void;

interface TextAreaProps {
  value: string;
  onChange: OnChange;
  thread: ThreadModel;
  fetchContacts: FetchContacts;
  haveContactsBeenClosed: boolean;
  setHaveContactsBeenClosed: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: () => void;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      value,
      onChange,
      thread,
      fetchContacts,
      haveContactsBeenClosed,
      setHaveContactsBeenClosed,
      onSubmit,
      ...props
    }: TextAreaProps,
    ref: ForwardedRef<HTMLTextAreaElement>
  ) {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const [areContactsShown, setAreContactsShown] = useState<boolean>(false);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [filteredContacts, setFilteredContacts2] = useState<Contact[]>([]);
    const [selectedContactIndex, setSelectedContactIndex] = useState<number>(0);

    const retrieveMentionStringAtCaretPosition = useCallback(
      function retrieveMentionStringAtCaretPosition() {
        const textArea = textAreaRef.current;

        if (textArea) {
          const isMentionStringNextToCaret = function isMentionStringNextToCaret(
            indexOfLastCharacterOfMentionString: number
          ): boolean {
            return (
              indexOfLastCharacterOfMentionString > textArea.selectionStart ||
              textArea.selectionStart - indexOfLastCharacterOfMentionString ===
                1
            );
          };

          if (textArea) {
            const mentionStringStartIndex = value
              .substr(0, textArea.selectionStart)
              .lastIndexOf('@');
            if (mentionStringStartIndex !== -1) {
              const value2 = value.substr(mentionStringStartIndex);
              /**
               * The email regular expression is based on the one that has been published here: https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
               * Source of license: https://github.com/whatwg/html/blob/main/LICENSE
               *
               * Copyright © WHATWG (Apple, Google, Mozilla, Microsoft).
               *
               * BSD 3-Clause License
               *
               * Redistribution and use in source and binary forms, with or without
               * modification, are permitted provided that the following conditions are met:
               *
               * 1. Redistributions of source code must retain the above copyright notice, this
               *    list of conditions and the following disclaimer.
               *
               * 2. Redistributions in binary form must reproduce the above copyright notice,
               *    this list of conditions and the following disclaimer in the documentation
               *    and/or other materials provided with the distribution.
               *
               * 3. Neither the name of the copyright holder nor the names of its
               *    contributors may be used to endorse or promote products derived from
               *    this software without specific prior written permission.
               *
               * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
               * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
               * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
               * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
               * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
               * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
               * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
               * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
               * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
               * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
               */
              const emailRegExp = new RegExp(
                "@(?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(?:@[a-zA-Z0-9]?(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9]?(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*)?)?"
              );
              const nameRegExp = new RegExp('@(?:\\w+ \\w*)?');
              const emailRegExpMatch = emailRegExp.exec(value2);
              const nameRegExpMatch = nameRegExp.exec(value2);
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
                  isMentionStringNextToCaret(
                    indexOfLastCharacterOfMentionString
                  )
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
      },
      [textAreaRef, value]
    );

    const retrieveMentionStringAfterAtCharacter = useCallback(
      function retrieveMentionStringAfterAtCharacter(): string | null {
        const mentionString = retrieveMentionStringAtCaretPosition();
        return mentionString ? mentionString.string.substr(1) : null;
      },
      [retrieveMentionStringAtCaretPosition]
    );

    const showContacts = useCallback(
      function showContacts() {
        if (!haveContactsBeenClosed) {
          setAreContactsShown(true);
        }
      },
      [haveContactsBeenClosed]
    );

    const hideContacts = useCallback(function hideContacts() {
      setAreContactsShown(false);
      setSelectedContactIndex(0);
    }, []);

    const filterContacts = useCallback(
      function filterContacts(contacts2: Contact[]) {
        const mentionStringAfterAtCharacter = retrieveMentionStringAfterAtCharacter();
        let newFilteredContacts;
        if (mentionStringAfterAtCharacter) {
          newFilteredContacts = contacts2.filter(
            doesContactMatchString.bind(null, mentionStringAfterAtCharacter)
          );
        } else {
          newFilteredContacts = contacts2;
        }
        return newFilteredContacts;
      },
      [retrieveMentionStringAfterAtCharacter]
    );

    const setFilteredContacts = useCallback(
      function setFilteredContacts(filteredContacts2) {
        setFilteredContacts2(filteredContacts2);
        setSelectedContactIndex(
          Math.min(selectedContactIndex, filteredContacts2.length - 1)
        );
      },
      [selectedContactIndex]
    );

    const updateFilteredContacts = useCallback(
      function updateFilteredContacts() {
        setFilteredContacts(filterContacts(contacts));
      },
      [contacts, filterContacts, setFilteredContacts]
    );

    const hasComments = useCallback(
      function hasComments() {
        return thread.comments.length >= 1;
      },
      [thread.comments.length]
    );

    const insertMention = useCallback(
      function insertMention(mentionedContact: Contact) {
        const mentionString = retrieveMentionStringAtCaretPosition();
        if (mentionString) {
          const textArea = textAreaRef.current!;
          const mentionInsertString = `@${mentionedContact.email} `;
          const newValue = `${value.substr(
            0,
            mentionString.startIndex
          )}${mentionInsertString}${value.substr(mentionString.endIndex + 1)}`;
          onChange(newValue);
          const selectionIndex =
            mentionString.startIndex + mentionInsertString.length;
          textArea.focus();
          textArea.setSelectionRange(selectionIndex, selectionIndex);
        }
      },
      [retrieveMentionStringAtCaretPosition, value, onChange]
    );

    const onContactSelected = useCallback(
      function onContactSelected(selectedContact: Contact) {
        hideContacts();
        insertMention(selectedContact);
      },
      [hideContacts, insertMention]
    );

    const onContactsClosed = useCallback(
      function onContactsClosed() {
        setHaveContactsBeenClosed(true);
      },
      [setHaveContactsBeenClosed]
    );

    const onKeyDown = useCallback(
      function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === '@' && !areContactsShown) {
          showContacts();
        }

        if (event.code === 'ArrowUp') {
          event.preventDefault();
          setSelectedContactIndex(Math.max(0, selectedContactIndex - 1));
        } else if (event.code === 'ArrowDown') {
          setSelectedContactIndex(
            Math.min(selectedContactIndex + 1, filteredContacts.length - 1)
          );
        } else if ((event.ctrlKey || event.metaKey) && event.code === 'Enter') {
          onSubmit();
          event.preventDefault();
        } else if (areContactsShown && event.code === 'Enter') {
          const selectedContact = filteredContacts[selectedContactIndex];
          onContactSelected(selectedContact);
          event.preventDefault();
        }
      },
      [
        areContactsShown,
        filteredContacts,
        onContactSelected,
        onSubmit,
        selectedContactIndex,
        showContacts,
      ]
    );

    const onKeyUp = useCallback(
      function onKeyUp() {
        setHaveContactsBeenClosed(false);

        updateFilteredContacts();

        const mentionStringAfterAtCharacter = retrieveMentionStringAfterAtCharacter();
        if (
          mentionStringAfterAtCharacter !== null &&
          (mentionStringAfterAtCharacter === '' ||
            contacts.some(
              doesContactMatchString.bind(null, mentionStringAfterAtCharacter)
            ))
        ) {
          if (!areContactsShown) {
            showContacts();
          }
        } else {
          hideContacts();
        }
      },
      [
        areContactsShown,
        contacts,
        hideContacts,
        retrieveMentionStringAfterAtCharacter,
        setHaveContactsBeenClosed,
        showContacts,
        updateFilteredContacts,
      ]
    );

    useEffect(
      function loadContacts() {
        async function loadContacts2() {
          const contacts2 = await fetchContacts();
          setContacts(contacts2);
          setFilteredContacts(filterContacts(contacts2));
        }

        loadContacts2();
      },
      [fetchContacts, filterContacts, setFilteredContacts]
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

    const { root: textArea } = createTextAreaStyles(props);

    const onChange2 = useCallback(
      function onChange2(event) {
        onChange(event.target.value);
      },
      [onChange]
    );

    return (
      <div className="mdc-menu-surface--anchor">
        <textarea
          ref={composeRefs(textAreaRef, ref)}
          value={value}
          onChange={onChange2}
          rows={1}
          css={textArea.css}
          className={textArea.className}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          placeholder={`${
            hasComments() ? 'Reply' : 'Comment'
          } or add others with @`}
        />
        {areContactsShown && (
          <Contacts
            contacts={filteredContacts}
            onSelected={onContactSelected}
            onClosed={onContactsClosed}
            selectedIndex={selectedContactIndex}
          />
        )}
      </div>
    );
  }
);
