import React, { useEffect, useRef } from 'react';

import { type TEquationElement, isHotkey } from 'platejs';
import { useEditorRef, useElement, useNodePath } from 'platejs/react';

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
  const path = useNodePath(element);
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
      if (!path) return;

      editor.update(
        (tx) => {
          tx.nodes.set<TEquationElement>(
            {
              texExpression: expressionInput || '',
            },
            { at: path }
          );
        },
        isInline ? { tag: 'history-merge' } : undefined
      );
    };
    // When the cursor is inside an inline equation, the popover needs to open.
    // However, during an undo operation, the cursor focuses on the inline equation, triggering the popover to open, which disrupts the normal undo process.
    // So we need to remove the inline equation focus in one times undo.
    // block equation will not block the undo process because it will not open the popover by focus.
    // The disadvantage of this approach for block equation is that the popover cannot be opened using the keyboard.
    setExpression();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expressionInput, path]);

  const onSubmit = () => {
    onClose?.();
  };

  const onDismiss = () => {
    if (isInline && path) {
      editor.update((tx) => {
        tx.nodes.set(
          {
            texExpression: initialExpressionRef.current,
          },
          { at: path }
        );
      });
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
            e.preventDefault();
            if (path) {
              const point = editor.api.before(path);

              if (point) {
                editor.update((tx) => {
                  tx.selection.set(point);
                });
              }
            }
          }
          // at the right edge
          if (
            selectionEnd === value.length &&
            selectionStart === value.length &&
            isHotkey('ArrowRight')(e)
          ) {
            e.preventDefault();
            if (path) {
              const point = editor.api.after(path);

              if (point) {
                editor.update((tx) => {
                  tx.selection.set(point);
                });
              }
            }
          }
        }
      },
    },
    ref: inputRef,
    onDismiss,
    onSubmit,
  };
};
