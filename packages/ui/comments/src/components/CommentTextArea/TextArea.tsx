import {
  Dispatch,
  KeyboardEvent,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import composeRefs from '@seznam/compose-react-refs';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import {
  Contact,
  doesContactMatchString,
  emailRegexExpression,
  nameRegexExpression,
  Thread,
} from '../../utils';

export type TextAreaProps = {
  fetchContacts: () => Contact[];
  haveContactsBeenClosed: boolean;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  setHaveContactsBeenClosed: Dispatch<SetStateAction<boolean>>;
  textAreaRef: RefObject<HTMLTextAreaElement> | null;
  thread: Thread;
  value: string;
} & HTMLPropsAs<'textarea'>;

export const useTextArea = (props: TextAreaProps) => {
  const {
    fetchContacts,
    haveContactsBeenClosed,
    onValueChange,
    onSubmit,
    setHaveContactsBeenClosed,
    textAreaRef,
    thread,
    value,
  } = props;
  const [areContactsShown, setAreContactsShown] = useState<boolean>(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts2] = useState<Contact[]>([]);
  const [selectedContactIndex, setSelectedContactIndex] = useState<number>(0);

  const hasComments = thread.comments.length >= 1;

  const ref = useRef<HTMLTextAreaElement | null>(null);

  const isMentionStringNextToCaret = useCallback(
    (indexOfLastCharacterOfMentionString: number) => {
      const textArea = ref.current;
      if (!textArea) {
        return false;
      }
      return Boolean(
        indexOfLastCharacterOfMentionString > textArea.selectionStart ||
          textArea.selectionStart - indexOfLastCharacterOfMentionString === 1
      );
    },
    []
  );

  const retrieveMentionStringAtCaretPosition = useCallback(() => {
    const textArea = ref.current;
    if (!textArea) {
      return null;
    }

    const mentionStringStartIndex = value
      .substr(0, textArea.selectionStart)
      .lastIndexOf('@');
    if (mentionStringStartIndex === -1) {
      return null;
    }
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
      if (isMentionStringNextToCaret(indexOfLastCharacterOfMentionString)) {
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

    return null;
  }, [isMentionStringNextToCaret, value]);

  const retrieveMentionStringAfterAtCharacter = useCallback(() => {
    const mentionString = retrieveMentionStringAtCaretPosition();
    return mentionString ? mentionString.string.substr(1) : null;
  }, [retrieveMentionStringAtCaretPosition]);

  const showContacts = useCallback(() => {
    if (!haveContactsBeenClosed) {
      setAreContactsShown(true);
    }
  }, [haveContactsBeenClosed]);

  const hideContacts = useCallback(() => {
    setAreContactsShown(false);
    setSelectedContactIndex(0);
  }, []);

  const filterContacts = useCallback(
    (contactsToFilter: Contact[]) => {
      const mentionStringAfterAtCharacter = retrieveMentionStringAfterAtCharacter();
      let newFilteredContacts;
      if (mentionStringAfterAtCharacter) {
        newFilteredContacts = contactsToFilter.filter(
          doesContactMatchString.bind(null, mentionStringAfterAtCharacter)
        );
      } else {
        newFilteredContacts = contactsToFilter;
      }
      return newFilteredContacts;
    },
    [retrieveMentionStringAfterAtCharacter]
  );

  const setFilteredContacts = useCallback(
    (filteredContacts2) => {
      setFilteredContacts2(filteredContacts2);
      setSelectedContactIndex(
        Math.min(selectedContactIndex, filteredContacts2.length - 1)
      );
    },
    [selectedContactIndex]
  );

  const updateFilteredContacts = useCallback(() => {
    setFilteredContacts(filterContacts(contacts));
  }, [contacts, filterContacts, setFilteredContacts]);

  const insertMention = useCallback(
    (mentionedContact: Contact) => {
      const mentionString = retrieveMentionStringAtCaretPosition();
      if (mentionString) {
        const textArea = ref.current!;
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
    [retrieveMentionStringAtCaretPosition, value, onValueChange]
  );

  const onContactSelected = useCallback(
    (selectedContact: Contact) => {
      hideContacts();
      insertMention(selectedContact);
    },
    [hideContacts, insertMention]
  );

  const onContactsClosed = useCallback(() => {
    setHaveContactsBeenClosed(true);
  }, [setHaveContactsBeenClosed]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
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

  const onKeyUp = useCallback(() => {
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
  }, [
    areContactsShown,
    contacts,
    hideContacts,
    retrieveMentionStringAfterAtCharacter,
    setHaveContactsBeenClosed,
    showContacts,
    updateFilteredContacts,
  ]);

  const loadContacts = useCallback(async () => {
    const fetchedContacts = await fetchContacts();
    setContacts(fetchedContacts);
    setFilteredContacts(filterContacts(fetchedContacts));
  }, [fetchContacts, filterContacts, setFilteredContacts]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    setTimeout(() => {
      const textArea = ref.current;
      if (textArea) {
        textArea.focus();
      }
    }, 0);
  }, [ref]);

  const onTextAreaValueChange = useCallback(
    (event) => {
      onValueChange(event.target.value);
    },
    [onValueChange]
  );

  return {
    ...props,
    onChange: onTextAreaValueChange,
    onKeyDown,
    onKeyUp,
    placeholder: `${hasComments ? 'Reply' : 'Comment'} or add others with @`,
    ref: composeRefs(textAreaRef, ref),
    rows: 1,
    value,
  };
};

export const TextArea = createComponentAs<TextAreaProps>((props) => {
  const htmlProps = useTextArea(props);
  return createElementAs('textarea', htmlProps);
});
