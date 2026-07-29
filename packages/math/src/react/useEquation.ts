import React, { useEffect, useRef } from 'react';

import { isHotkey } from '@platejs/core';
import { useEditor, useElement } from '@platejs/core/react';
import type { TEquationElement } from '@platejs/utils';
import katex, { type KatexOptions } from 'katex';

export const useEquationElement = ({
  element,
  katexRef,
  options,
}: {
  element: TEquationElement;
  katexRef: React.MutableRefObject<HTMLDivElement | null>;
  options?: KatexOptions;
}) => {
  React.useEffect(() => {
    if (!katexRef.current) return;

    katex.render(element.texExpression, katexRef.current, options);
  }, [element.texExpression, katexRef, options]);
};

export const useEquationInput = ({
  isInline,
  open,
  onClose,
}: {
  isInline?: boolean;
  open?: boolean;
  onClose?: () => void;
}) => {
  const editor = useEditor();
  const element = useElement<TEquationElement>();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [expressionInput, setExpressionInput] = React.useState<string>(
    element.texExpression
  );

  const initialExpressionRef = useRef<string>(element.texExpression);
  const effectContextRef = useRef({ editor, element, isInline });

  useEffect(() => {
    effectContextRef.current = { editor, element, isInline };
  }, [editor, element, isInline]);

  useEffect(() => {
    if (!open) return;

    const timeoutId = setTimeout(() => {
      if (!inputRef.current) return;

      inputRef.current.focus();
      inputRef.current.select();

      const { element, isInline } = effectContextRef.current;

      if (isInline) {
        initialExpressionRef.current = element.texExpression;
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [open]);

  useEffect(() => {
    const { editor, element, isInline } = effectContextRef.current;

    if (isInline) {
      editor
        .update({ tags: 'history-merge' })
        .nodes.set<TEquationElement>(
          { texExpression: expressionInput },
          { at: element }
        );
    } else {
      editor.update.nodes.set<TEquationElement>(
        { texExpression: expressionInput },
        { at: element }
      );
    }
  }, [expressionInput]);

  const onSubmit = () => {
    onClose?.();
  };

  const onDismiss = () => {
    if (isInline) {
      editor.update.nodes.set<TEquationElement>(
        { texExpression: initialExpressionRef.current },
        { at: element }
      );
    }

    onClose?.();
  };

  return {
    props: {
      value: expressionInput,
      onChange: (
        e: Pick<React.ChangeEvent<HTMLTextAreaElement>, 'currentTarget'>
      ) => {
        setExpressionInput(e.currentTarget.value);
      },
      onKeyDown: (
        e: Pick<
          React.KeyboardEvent<HTMLTextAreaElement>,
          | 'altKey'
          | 'ctrlKey'
          | 'currentTarget'
          | 'key'
          | 'metaKey'
          | 'preventDefault'
          | 'shiftKey'
          | 'which'
        >
      ) => {
        if (isHotkey('enter')(e)) {
          e.preventDefault();
          onSubmit();
        } else if (isHotkey('escape')(e)) {
          e.preventDefault();
          onDismiss();
        }
        if (isInline) {
          const { selectionEnd, selectionStart, value } = e.currentTarget;

          // at the left edge
          if (
            selectionStart === 0 &&
            selectionEnd === 0 &&
            isHotkey('ArrowLeft')(e)
          ) {
            e.preventDefault();
            selectOutsideEquation('before');
          }
          // at the right edge
          if (
            selectionEnd === value.length &&
            selectionStart === value.length &&
            isHotkey('ArrowRight')(e)
          ) {
            e.preventDefault();
            selectOutsideEquation('after');
          }
        }
      },
    },
    ref: inputRef,
    onDismiss,
    onSubmit,
  };

  function selectOutsideEquation(direction: 'after' | 'before') {
    const point = editor.read.points[direction](element);

    if (!point) return;

    editor.update({ tags: 'focus' }).selection.set(point);
  }
};
