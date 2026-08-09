import { useEditorReadOnly, useEditor, useElement } from '@platejs/core/react';

import { CalloutPlugin } from './CalloutPlugin';

const CALLOUT_STORAGE_KEY = 'plate-storage-callout';

export type UseCalloutEmojiPickerOptions = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const useCalloutEmojiPicker = ({
  isOpen,
  setIsOpen,
}: UseCalloutEmojiPickerOptions) => {
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const element = useElement(CalloutPlugin);

  return {
    emojiToolbarDropdownProps: {
      isOpen,
      setIsOpen: (v: boolean) => {
        if (readOnly) return;

        setIsOpen(v);
      },
    },
    props: {
      isOpen,
      setIsOpen,
      onSelectEmoji: (emojiValue: {
        icon?: string;
        skins?: { native?: string }[];
      }) => {
        const icon = emojiValue.skins?.[0]?.native ?? emojiValue.icon;

        if (!icon) return;

        editor.update.nodes.set({ icon }, { at: element });

        localStorage.setItem(CALLOUT_STORAGE_KEY, icon);
        setIsOpen(false);
      },
    },
  };
};
