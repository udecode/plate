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
  const pluginKey = id || ELEMENT_MENTION;
  const onSelectMentionItem = getMentionOnSelectItem(pluginKey);

  useEffect(() => {
    comboboxStore.set.setComboboxById({
      id: pluginKey,
      trigger: trigger || COMBOBOX_TRIGGER_MENTION,
      onSelectItem: onSelectMentionItem,
    });
  }, [pluginKey, onSelectMentionItem, trigger]);

  if (activeId !== pluginKey) return null;

  return (
    <Combobox items={items} component={component} onRenderItem={onRenderItem} />
  );
};
