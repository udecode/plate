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

export const MentionCombobox = ({
  items,
  component,
  onRenderItem,
  id,
  trigger,
}: Pick<ComboboxProps, 'items' | 'component' | 'onRenderItem'> & {
  id?: string;
  trigger?: string;
}) => {
  const activeId = comboboxStore.use.activeId();

  useEffect(() => {
    comboboxStore.set.setComboboxById({
      id: id || ELEMENT_MENTION,
      trigger: trigger || COMBOBOX_TRIGGER_MENTION,
      onSelectItem: onSelectMentionItem,
    });
  }, [id, trigger]);

  if (activeId !== id) return null;

  return (
    <Combobox items={items} component={component} onRenderItem={onRenderItem} />
  );
};
