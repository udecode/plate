import React from 'react';
import { Combobox } from '@udecode/plate-combobox';
import {
  COMBOBOX_TRIGGER_MENTION,
  ELEMENT_MENTION,
  getMentionOnSelectItem,
} from '@udecode/plate-mention';
import { MentionComboboxEffect } from './MentionComboboxEffect';
import { MentionComboboxItem } from './MentionComboboxItem';

const onSelectItem = getMentionOnSelectItem();

export const MentionCombobox = () => (
  <Combobox
    id={ELEMENT_MENTION}
    component={MentionComboboxEffect}
    trigger={COMBOBOX_TRIGGER_MENTION}
    onRenderItem={MentionComboboxItem}
    onSelectItem={onSelectItem}
  />
);
