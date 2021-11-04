import React from 'react';
import { Combobox, ComboboxProps, Data, NoData } from '@udecode/plate-combobox';
import { PlatePluginKey } from '@udecode/plate-core';
import {
  COMBOBOX_TRIGGER_MENTION,
  CreateMentionNode,
  ELEMENT_MENTION,
  getMentionOnSelectItem,
} from '@udecode/plate-mention';

export const MentionCombobox = <TData extends Data = NoData>({
  items,
  component,
  onRenderItem,
  pluginKey = ELEMENT_MENTION,
  id = pluginKey,
  trigger = COMBOBOX_TRIGGER_MENTION,
  insertSpaceAfterMention,
  createMentionNode,
}: Pick<ComboboxProps<TData>, 'items' | 'component' | 'onRenderItem'> & {
  id?: string;
  trigger?: string;
  insertSpaceAfterMention?: boolean;
  createMentionNode?: CreateMentionNode<TData>;
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
