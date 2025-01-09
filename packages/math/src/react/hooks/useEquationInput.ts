import React, { useEffect, useRef } from 'react';

import { isHotkey } from '@udecode/plate';
import { useEditorRef, useElement } from '@udecode/plate/react';

import type { TEquationElement } from '../../lib';

export const useEquationInput = ({
  isInline,
  open,
  onClose,
}: {
  isInline?: boolean;
  open?: boolean;
  onClose?: () => void;
}) => {
  const editor = useEditorRef();
  const element = useElement<TEquationElement>();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [expressionInput, setExpressionInput] = React.useState<string>(
    element.texExpression
  );

  const initialExpressionRef = useRef<string>(element.texExpression);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();

          if (isInline) {
            initialExpressionRef.current = element.texExpression;
          }
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const setExpression = () => {
      editor.tf.setNodes<TEquationElement>(
        {
          texExpression: expressionInput || '',
        },
        { at: element }
      );
    };
    // When the cursor is inside an inline equation, the popover needs to open.
    // However, during an undo operation, the cursor focuses on the inline equation, triggering the popover to open, which disrupts the normal undo process.
    // So we need to remove the inline equation focus in one times undo.
    // block equation will not block the undo process because it will not open the popover by focus.
    // The disadvantage of this approach for block equation is that the popover cannot be opened using the keyboard.
    isInline ? editor.tf.withMerging(setExpression) : setExpression();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expressionInput]);

  const onSubmit = () => {
    onClose?.();
  };

  const onDismiss = () => {
    if (isInline) {
      editor.tf.setNodes(
        {
          texExpression: initialExpressionRef.current,
        },
        { at: element }
      );
    }

    onClose?.();
  };

  return {
    props: {
      value: expressionInput,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setExpressionInput(e.target.value);
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isHotkey('enter')(e)) {
          e.preventDefault();
          onSubmit();
        } else if (isHotkey('escape')(e)) {
          e.preventDefault();
          onDismiss();
        }
        if (isInline) {
          const { selectionEnd, selectionStart, value } =
            e.target as HTMLInputElement;

          // at the left edge
          if (
            selectionStart === 0 &&
            selectionEnd === 0 &&
            isHotkey('ArrowLeft')(e)
          ) {
            editor.tf.select(element, {
              previous: true,
            });
          }
          // at the right edge
          if (
            selectionEnd === value.length &&
            selectionStart === value.length &&
            isHotkey('ArrowRight')(e)
          ) {
            editor.tf.select(element, { next: true });
          }
        }
      },
    },
    ref: inputRef,
    onDismiss,
    onSubmit,
  };
};
