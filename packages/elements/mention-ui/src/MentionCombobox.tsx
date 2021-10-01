import React from 'react';
import { Combobox, ComboboxProps } from '@udecode/plate-combobox';
import {
  COMBOBOX_TRIGGER_MENTION,
  ELEMENT_MENTION,
  getMentionOnSelectItem,
} from '@udecode/plate-mention';

const onSelectMentionItem = getMentionOnSelectItem();

export const MentionCombobox = ({
  id = ELEMENT_MENTION,
  trigger = COMBOBOX_TRIGGER_MENTION,
  onSelectItem = onSelectMentionItem,
  ...props
}: Partial<ComboboxProps>) => {
  const defaultProps: ComboboxProps = {
    id,
    trigger,
    onSelectItem,
    ...props,
  };

  return <Combobox {...defaultProps} />;
};
