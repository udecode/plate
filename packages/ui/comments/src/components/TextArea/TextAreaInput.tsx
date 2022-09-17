import { useCallback, useEffect } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { Thread, User } from '../../types';
import { doesContactMatchString } from '../../utils';
import {
  threadTextAreaActions,
  threadTextAreaSelectors,
} from './threadTextAreaStore';

export type TextAreaInputProps = {
  thread: Thread;
  onValueChange: (newValue: string) => void;
  setHaveContactsBeenClosed: React.Dispatch<React.SetStateAction<boolean>>;
  haveContactsBeenClosed: boolean;
  value: string;
  onSubmit: () => void;
  fetchContacts: () => User[];
  retrieveMentionStringAtCaretPosition: () => {
    string: string;
    startIndex: number;
    endIndex: number;
  } | null;
  onContactSelected: (selectedContact: User) => void;
} & HTMLPropsAs<'textarea'>;

export const useTextAreaInput = (
  props: TextAreaInputProps
): HTMLPropsAs<'textarea'> => {
  const {
    thread,
    onValueChange,
    setHaveContactsBeenClosed,
    haveContactsBeenClosed,
    onSubmit,
    fetchContacts,
    retrieveMentionStringAtCaretPosition,
    onContactSelected,
  } = props;

  const contacts = threadTextAreaSelectors.contacts();
  const areContactsShown = threadTextAreaSelectors.areContactsShown();
  const filteredContacts = threadTextAreaSelectors.filteredContacts();
  const selectedContactIndex = threadTextAreaSelectors.selectedContactIndex();

  const hasComments = thread.comments.length >= 1;
  const placeholder = `${
    hasComments ? 'Reply' : 'Comment'
  } or add others with @`;

  const onChange = useCallback(
    (event) => {
      onValueChange(event.target.value);
    },
    [onValueChange]
  );

  const setFilteredContacts = useCallback(
    (filteredContacts2) => {
      threadTextAreaActions.filteredContacts(filteredContacts2);
      threadTextAreaActions.selectedContactIndex(
        Math.min(selectedContactIndex, filteredContacts2.length - 1)
      );
    },
    [selectedContactIndex]
  );

  const retrieveMentionStringAfterAtCharacter = useCallback(():
    | string
    | null => {
    const mentionString = retrieveMentionStringAtCaretPosition();
    return mentionString ? mentionString.string.substr(1) : null;
  }, [retrieveMentionStringAtCaretPosition]);

  const filterContacts = useCallback(
    function filterContacts(contacts2: User[]) {
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

  const updateFilteredContacts = useCallback(
    function updateFilteredContacts() {
      setFilteredContacts(filterContacts(contacts));
    },
    [contacts, filterContacts, setFilteredContacts]
  );

  const showContacts = useCallback(() => {
    if (!haveContactsBeenClosed) {
      threadTextAreaActions.areContactsShown(true);
    }
  }, [haveContactsBeenClosed]);

  const hideContacts = useCallback(() => {
    threadTextAreaActions.areContactsShown(false);
    threadTextAreaActions.selectedContactIndex(0);
  }, []);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === '@' && !areContactsShown) {
        showContacts();
      }

      if (event.code === 'ArrowUp') {
        event.preventDefault();
        threadTextAreaActions.selectedContactIndex(
          Math.max(0, selectedContactIndex - 1)
        );
      } else if (event.code === 'ArrowDown') {
        threadTextAreaActions.selectedContactIndex(
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

  useEffect(
    function loadContacts() {
      async function loadContacts2() {
        const contacts2 = fetchContacts();
        threadTextAreaActions.contacts(contacts2);
        setFilteredContacts(filterContacts(contacts2));
      }

      loadContacts2();
    },
    [fetchContacts, filterContacts, setFilteredContacts]
  );

  return { ...props, placeholder, rows: 1, onChange, onKeyUp, onKeyDown };
};

export const TextAreaInput = createComponentAs<TextAreaInputProps>((props) => {
  const htmlProps = useTextAreaInput(props);
  return createElementAs('textarea', htmlProps);
});
