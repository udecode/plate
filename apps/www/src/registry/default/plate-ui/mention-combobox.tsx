import React from 'react';

import type { ComboboxProps } from '@udecode/plate-combobox';

import { getPluginOptions, useEditorRef } from '@udecode/plate-common';
import {
  ELEMENT_MENTION,
  type MentionPlugin,
  getMentionOnSelectItem,
} from '@udecode/plate-mention';

import { Combobox } from './combobox';

export function MentionCombobox({
  pluginKey = ELEMENT_MENTION,
  id = pluginKey,
  ...props
}: {
  pluginKey?: string;
} & Partial<ComboboxProps>) {
  const editor = useEditorRef();

  const { trigger } = getPluginOptions<MentionPlugin>(editor, pluginKey);

  return (
    <div onMouseDown={(e) => e.preventDefault()}>
      <Combobox
        controlled
        id={id}
        onSelectItem={getMentionOnSelectItem({
          key: pluginKey,
        })}
        trigger={trigger!}
        {...props}
      />
    </div>
  );
}
