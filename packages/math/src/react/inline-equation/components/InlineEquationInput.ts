import React, { useEffect } from 'react';

import { isHotkey, setNodes } from '@udecode/plate-common';
import {
  findNodePath,
  useEditorRef,
  useEditorSelector,
  useElement,
} from '@udecode/plate-common/react';

import type { TInlineEquationElement } from '../../../lib/inline-equation/types';

import { setSelectionInlineEquation } from '../utils/setSelectionInlineEquation';

export const useInlineEquationInputState = ({
  isOpen,
}: {
  isOpen: boolean;
}) => {
  const editor = useEditorRef();
  const element = useElement<TInlineEquationElement>();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // if user press escape revert
  const [originExpression, setOriginExpressin] = React.useState<null | string>(
    null
  );

  const inlineEquationPath = useEditorSelector(
    (editor) => findNodePath(editor, element),
    []
  );

  return {
    editor,
    element,
    inlineEquationPath,
    inputRef,
    isOpen,
    originExpression,
    setOriginExpressin,
  };
};

export const useInlineEquationInput = ({
  editor,
  element,
  inlineEquationPath,
  inputRef,
  isOpen,
  originExpression,
  setOriginExpressin,
}: ReturnType<typeof useInlineEquationInputState>) => {
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(0, element.texExpression.length);
        setOriginExpressin(element.texExpression);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return {
    props: {
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setNodes<TInlineEquationElement>(
          editor,
          {
            texExpression: e.target.value,
          },
          { at: inlineEquationPath }
        );
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!inlineEquationPath) return;

        const input = e.target as HTMLInputElement;
        const { selectionEnd, selectionStart } = input;

        // at the left edge
        if (
          selectionStart === 0 &&
          selectionEnd === 0 &&
          isHotkey('ArrowLeft')(e)
        ) {
          setSelectionInlineEquation(editor, inlineEquationPath, 'left');
        }
        // at the right edge
        if (
          selectionEnd === input.value.length &&
          selectionStart === input.value.length &&
          isHotkey('ArrowRight')(e)
        ) {
          setSelectionInlineEquation(editor, inlineEquationPath, 'right');
        }
        // pressingt the enter set to right edge
        if (isHotkey('Enter')(e)) {
          e.preventDefault();
          setSelectionInlineEquation(editor, inlineEquationPath, 'right');
        }
        // revert to the originExpression when pressing the escape
        if (isHotkey('escape')(e)) {
          setNodes<TInlineEquationElement>(
            editor,
            {
              texExpression: originExpression,
            },
            { at: inlineEquationPath }
          );

          setSelectionInlineEquation(editor, inlineEquationPath, 'right');
        }
      },
      ref: inputRef,
      value: element.texExpression,
    },
  };
};
