import React from 'react';
import { Data, NoData } from '@udecode/plate-combobox';
import { getPluginOptions, usePlateEditorRef } from '@udecode/plate-core';
import {
  ELEMENT_MENTION,
  getMentionOnSelectItem,
  MentionPlugin,
} from '@udecode/plate-mention';
import { ComboboxProps, PlateCombobox } from '@udecode/plate-ui-combobox';

export interface MentionComboboxProps<TData extends Data = NoData>
  extends Partial<ComboboxProps<TData>> {
  pluginKey?: string;
}

export const MentionCombobox = <TData extends Data = NoData>({
  pluginKey = ELEMENT_MENTION,
  id = pluginKey,
  ...props
}: MentionComboboxProps<TData>) => {
  const editor = usePlateEditorRef();

  const { trigger } = getPluginOptions<MentionPlugin>(editor, pluginKey);

  return (
    <PlateCombobox
      id={id}
      trigger={trigger!}
      controlled
      onSelectItem={getMentionOnSelectItem({
        key: pluginKey,
      })}
      {...props}
    />
  );
};
