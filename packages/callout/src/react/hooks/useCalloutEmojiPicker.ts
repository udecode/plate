import type { TCalloutElement } from 'platejs';

import {
  useEditorReadOnly,
  useEditorRef,
  useElement,
  useNodePath,
} from 'platejs/react';

import { CALLOUT_STORAGE_KEY } from '../../lib';

export type UseCalloutEmojiPickerOptions = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export const useCalloutEmojiPicker = ({
  isOpen,
  setIsOpen,
}: UseCalloutEmojiPickerOptions) => {
  const editor = useEditorRef();
  const readOnly = useEditorReadOnly();
  const element = useElement<TCalloutElement>();
  const path = useNodePath(element);

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

        if (!path) return;

        editor.update((tx) => {
          tx.nodes.set<TCalloutElement>({ icon }, { at: path });
        });

        localStorage.setItem(CALLOUT_STORAGE_KEY, icon);
        setIsOpen(false);
      },
    },
  };
};
