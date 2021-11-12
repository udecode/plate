import React from 'react';
import { Combobox, ComboboxProps, Data, NoData } from '@udecode/plate-combobox';
import {
  getPlugin,
  PlatePluginKey,
  usePlateEditorRef,
} from '@udecode/plate-core';
import {
  ELEMENT_MENTION,
  getMentionOnSelectItem,
  MentionPluginOptions,
} from '@udecode/plate-mention';

export const MentionCombobox = <TData extends Data = NoData>({
  items,
  component,
  onRenderItem,
  pluginKey = ELEMENT_MENTION,
  id = pluginKey,
}: Pick<
  Partial<ComboboxProps<TData>>,
  'id' | 'items' | 'component' | 'onRenderItem'
> & { pluginKey?: string }) => {
  const editor = usePlateEditorRef();

  const { trigger } = getPlugin<Required<MentionPluginOptions>>(
    editor,
    pluginKey
  );

  return (
    <Combobox
      id={id}
      trigger={trigger}
      controlled
      items={items}
      component={component}
      onRenderItem={onRenderItem}
      onSelectItem={getMentionOnSelectItem({
        key: pluginKey,
      })}
    />
  );
};
