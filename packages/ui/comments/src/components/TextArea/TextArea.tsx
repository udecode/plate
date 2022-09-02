import React from 'react';
import composeRefs from '@seznam/compose-react-refs';
import { Contacts } from '../Contacts/Contacts';
import { getTextAreaStyles } from './TextArea.styles';
import { TextAreaStyleProps } from './TextArea.types';
import { useTextArea } from './useTextArea';

export const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  TextAreaStyleProps
>((props, ref) => {
  const {
    areContactsShown,
    filteredContacts,
    hasComments,
    onContactsClosed,
    onContactSelected,
    onKeyDown,
    onKeyUp,
    onTextAreaValueChange,
    selectedContactIndex,
    textAreaRef,
    value,
  } = useTextArea(props);

  const styles = getTextAreaStyles(props);

  return (
    <div className="mdc-menu-surface--anchor">
      <textarea
        ref={composeRefs(textAreaRef, ref)}
        value={value}
        onChange={onTextAreaValueChange}
        rows={1}
        css={styles.root.css}
        className={styles.root.className}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        placeholder={`${
          hasComments ? 'Reply' : 'Comment'
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
});
