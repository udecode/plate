import React, { ReactNode, useCallback, useState } from 'react';
import { useEventPlateId, usePlateEditorState } from '@udecode/plate-core';
import {
  EmojiFlyoutIndexSearch,
  EmojiFlyoutLibrary,
  useEmojiPicker,
  UseEmojiPickerType,
} from '@udecode/plate-emoji';
import {
  ToolbarButton,
  ToolbarButtonProps,
  ToolbarDropdown,
} from '@udecode/plate-ui-toolbar';
import { EmojiPicker } from '../EmojiPicker';
import icons from '../icons';

type EmojiToolbarDropdownProps = {
  pluginKey: string;
  icon: ReactNode;
  EmojiPickerComponent?: (props: UseEmojiPickerType) => JSX.Element;
} & ToolbarButtonProps;

export const EmojiToolbarDropdown = ({
  id,
  icon,
  EmojiPickerComponent = EmojiPicker,
  pluginKey,
  ...rest
}: EmojiToolbarDropdownProps) => {
  id = useEventPlateId(id);
  const editor = usePlateEditorState(id);
  const isActive = !!editor?.selection;
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);

  const emojiFlyoutLibrary = EmojiFlyoutLibrary.getInstance();
  const emojiFlyoutIndexSearch = EmojiFlyoutIndexSearch.getInstance(
    emojiFlyoutLibrary
  );
  const emojiPickerState = useEmojiPicker({
    isOpen,
    editor,
    emojiLibrary: emojiFlyoutLibrary,
    indexSearch: emojiFlyoutIndexSearch,
  });

  return (
    <ToolbarDropdown
      control={<ToolbarButton active={isActive} icon={icon} {...rest} />}
      open={isOpen}
      onOpen={onToggle}
      onClose={onToggle}
    >
      <EmojiPickerComponent {...emojiPickerState} icons={icons} />
    </ToolbarDropdown>
  );
};
