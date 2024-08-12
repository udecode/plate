import React, { useEffect } from 'react';

import { addSelectedRow, isHotkey, setNodes } from '@udecode/plate-common';
import { useEditorRef, useElement } from '@udecode/plate-common/react';

import type { TEquationElement } from '../types';

export const useEquationInputState = ({ isOpen }: { isOpen: boolean }) => {
  const editor = useEditorRef();
  const element = useElement<TEquationElement>();
  const inputRef = React.useRef<HTMLInputElement>(null);

  return { editor, element, inputRef, isOpen };
};

export const useEquationInput = ({
  editor,
  element,
  inputRef,
  isOpen,
}: ReturnType<typeof useEquationInputState>) => {
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return {
    props: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setNodes<TEquationElement>(editor, {
          texExpression: e.target.value,
        });
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isHotkey('enter')(e) || isHotkey('escape')(e)) {
          e.preventDefault();
          addSelectedRow(editor, element.id as string);
        }
      },
      onMouseEnter: () => {
        inputRef.current?.focus();
      },
      ref: inputRef,
      value: element.texExpression,
    },
  };
};
