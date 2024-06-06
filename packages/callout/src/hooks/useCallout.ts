import React from 'react';

import {
  type TElement,
  findNodePath,
  setNodes,
  useEditorRef,
  useElement,
} from '@udecode/plate-common';

export interface TCalloutElement extends TElement {
  backgroundColor?: string;
  color?: string;
  icon?: string;
  variant?: 'info' | 'note' | 'tip' | 'warning';
}

export const useCalloutState = () => {
  const editor = useEditorRef();
  const element = useElement<TCalloutElement>();

  const setCalloutState = React.useCallback(
    (value: Partial<TCalloutElement>) => {
      const path = findNodePath(editor, element);

      if (!path) return;

      setNodes<TCalloutElement>(editor, value, { at: path });
    },
    [editor, element]
  );

  return {
    icon: element.icon,
    id: element.id,
    setCalloutState,
    variant: element.variant,
  };
};

interface useCalloutEmojiPick {
  isOpen: boolean;
  readOnly: boolean;
  setCalloutState: any;
  setIsOpen: (isOpen: boolean) => void;
}

export const useCalloutEmojiPick = ({
  isOpen,
  readOnly,
  setCalloutState,
  setIsOpen,
}: useCalloutEmojiPick) => {
  return {
    dropDownProps: {
      isOpen,
      setIsOpen: (v: boolean) => {
        if (readOnly) return;

        setIsOpen(v);
      },
    },
    props: {
      isOpen,
      onSelectEmoji: (emojiValue: any) => {
        setCalloutState({ icon: emojiValue.skins[0].native });
        setIsOpen(false);
      },
      setIsOpen,
    },
  };
};
