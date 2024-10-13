import type React from 'react';
import { useEffect, useRef } from 'react';

import { isHotkey, setNodes } from '@udecode/plate-common';
import { useEditorRef, useElement } from '@udecode/plate-common/react';

import type { TEquationElement } from '../../lib';

export const useEquationInput = ({ open }: { open?: boolean }) => {
  const editor = useEditorRef();
  const element = useElement<TEquationElement>();
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 0);
    }
  }, [open]);

  return {
    props: {
      value: element.texExpression,
      onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNodes<TEquationElement>(editor, {
          texExpression: e.target.value,
        });
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (isHotkey('enter', e) || isHotkey('escape', e)) {
          e.preventDefault();

          editor
            .getApi({ key: 'blockSelection' })
            .blockSelection?.addSelectedRow?.(element.id);
        } else if (isHotkey('meta+z', e)) {
          e.preventDefault();
          editor.undo();
        } else if (isHotkey('meta+y', e) || isHotkey('meta+shift+z', e)) {
          e.preventDefault();
          editor.redo();
        }
      },
    },
    ref: inputRef,
  };
};
