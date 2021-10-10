import React, { useEffect } from 'react';
import {
  Combobox,
  ComboboxProps,
  comboboxStore,
} from '@udecode/plate-combobox';
import {
  COMBOBOX_TRIGGER_MENTION,
  ELEMENT_MENTION,
  getMentionOnSelectItem,
} from '@udecode/plate-mention';

const onSelectMentionItem = getMentionOnSelectItem();

const id = ELEMENT_MENTION;

export const MentionCombobox = ({
  items,
}: Pick<ComboboxProps, 'items' | 'component' | 'onRenderItem'>) => {
  const activeId = comboboxStore.use.activeId();

  useEffect(() => {
    comboboxStore.set.setComboboxById({
      id,
      trigger: COMBOBOX_TRIGGER_MENTION,
      onSelectItem: onSelectMentionItem,
    });
  }, []);

  if (activeId !== id) return null;

  return <Combobox items={items} />;
};
