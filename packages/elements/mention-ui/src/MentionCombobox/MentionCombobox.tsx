import React from 'react';
import { Combobox, ComboboxProps } from '@udecode/plate-combobox';
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
  pluginKey = ELEMENT_MENTION,
  id = pluginKey,
  trigger = COMBOBOX_TRIGGER_MENTION,
  insertSpaceAfterMention,
  createMentionNode,
}: Pick<ComboboxProps, 'items' | 'component' | 'trigger' | 'onRenderItem'> & {
  id?: string;
  insertSpaceAfterMention?: boolean;
  createMentionNode?: CreateMentionNode;
} & PlatePluginKey) => (
  <Combobox
    id={id}
    trigger={trigger}
    controlled
    items={items}
    component={component}
    onRenderItem={onRenderItem}
    onSelectItem={getMentionOnSelectItem({
      pluginKey: id,
      insertSpaceAfterMention,
      createMentionNode,
    })}
  />
);
