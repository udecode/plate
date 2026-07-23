import { useEditorReadOnly, useEditor, useElement } from '@platejs/core/react';
import type { TCalloutElement } from '@platejs/utils';

import { CALLOUT_STORAGE_KEY } from '../../lib';

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
  const element = useElement<TCalloutElement>();

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
      onSelectEmoji: (emojiValue: any) => {
        const icon = emojiValue.skins?.[0]?.native ?? emojiValue.icon;

        editor.update.nodes.set({ icon }, { at: element });

        localStorage.setItem(CALLOUT_STORAGE_KEY, icon);
        setIsOpen(false);
      },
    },
  };
};
