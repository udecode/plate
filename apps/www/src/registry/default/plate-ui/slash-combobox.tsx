import React from 'react';

import type { ComboboxProps } from '@udecode/plate-combobox';

import { getPluginOptions, useEditorRef } from '@udecode/plate-common';
import {
  KEY_SLASH_COMMAND,
  type SlashPlugin,
  getSlashOnSelectItem,
} from '@udecode/plate-slash-command';

import { Combobox } from './combobox';

export function SlashCombobox({
  pluginKey = KEY_SLASH_COMMAND,
  id = pluginKey,
  ...props
}: {
  pluginKey?: string;
} & Partial<ComboboxProps>) {
  const editor = useEditorRef();

  const { trigger } = getPluginOptions<SlashPlugin>(editor, pluginKey);

  return (
    <div onMouseDown={(e) => e.preventDefault()}>
      <Combobox
        controlled
        id={id}
        onSelectItem={getSlashOnSelectItem({
          key: pluginKey,
        })}
        trigger={trigger!}
        {...props}
      />
    </div>
  );
}
