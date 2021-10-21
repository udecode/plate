import React, { useEffect } from 'react';
import {
  Combobox,
  ComboboxProps,
  comboboxStore,
} from '@udecode/plate-combobox';
import { PlatePluginKey } from '@udecode/plate-core';
import {
  COMBOBOX_TRIGGER_MENTION,
  CreateMentionNode,
  ELEMENT_MENTION,
  getMentionOnSelectItem,
} from '@udecode/plate-mention';

export const MentionCombobox = ({
  items,
  component,
  onRenderItem,
  id: _id,
  pluginKey = ELEMENT_MENTION,
  trigger = COMBOBOX_TRIGGER_MENTION,
  searchPattern,
  insertSpaceAfterMention,
  createMentionNode,
}: Pick<ComboboxProps, 'items' | 'component' | 'onRenderItem'> & {
  id?: string;
  trigger?: string;
  searchPattern?: string;
  insertSpaceAfterMention?: boolean;
  createMentionNode?: CreateMentionNode;
} & PlatePluginKey) => {
  const id = _id ?? pluginKey;

  const activeId = comboboxStore.use.activeId();
  const onSelectMentionItem = getMentionOnSelectItem({
    pluginKey,
    insertSpaceAfterMention,
    createMentionNode,
  });

  useEffect(() => {
    comboboxStore.set.setComboboxById({
      id,
      trigger,
      searchPattern,
      onSelectItem: onSelectMentionItem,
    });
  }, [pluginKey, onSelectMentionItem, trigger, id, searchPattern]);

  if (activeId !== id) return null;

  return (
    <Combobox items={items} component={component} onRenderItem={onRenderItem} />
  );
};
