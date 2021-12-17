import React from 'react';
import { Data, NoData } from '@udecode/plate-combobox';
import { getPluginOptions, usePlateEditorRef } from '@udecode/plate-core';
import {
  ELEMENT_MENTION,
  getMentionOnSelectItem,
  MentionPlugin,
} from '@udecode/plate-mention';
import { Combobox, ComboboxProps } from '@udecode/plate-ui-combobox';

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
  const editor = usePlateEditorRef()!;

  const { trigger } = getPluginOptions<MentionPlugin>(editor, pluginKey);

  return (
    <Combobox
      id={id}
      trigger={trigger!}
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
