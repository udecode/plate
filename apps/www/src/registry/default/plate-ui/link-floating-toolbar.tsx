'use client';

import React from 'react';
import { useEditorRef } from '@udecode/plate-core';
import {
  flip,
  offset,
  UseVirtualFloatingOptions,
} from '@udecode/plate-floating';
import {
  FloatingLinkUrlInput,
  LinkFloatingToolbarState,
  LinkOpenButton,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
} from '@udecode/plate-link';
import { useCallback, useMemo } from 'react';
import { ReactEditor } from 'slate-react';

import { cn } from '@/lib/utils';

import { Icons } from '@/components/icons';

import { buttonVariants } from './button';
import { inputVariants } from './input';
import { popoverVariants } from './popover';
import { Separator } from './separator';

const floatingOptions: UseVirtualFloatingOptions = {
  placement: 'bottom-start',
  middleware: [
    offset(12),
    flip({
      padding: 12,
      fallbackPlacements: ['bottom-end', 'top-start', 'top-end'],
    }),
  ],
};

export interface LinkFloatingToolbarProps {
  state?: LinkFloatingToolbarState;
}

export function LinkFloatingToolbar({ state }: LinkFloatingToolbarProps) {
  const editor = useEditorRef();

  const insertState = useFloatingLinkInsertState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    props: insertProps,
    ref: insertRef,
    hidden,
    textInputProps,
  } = useFloatingLinkInsert(insertState);

  const editState = useFloatingLinkEditState({
    ...state,
    floatingOptions: {
      ...floatingOptions,
      ...state?.floatingOptions,
    },
  });
  const {
    props: editProps,
    ref: editRef,
    editButtonProps,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState);

  const getSelectionAbsolutePosition = useCallback(() => {
    if (!editor.selection) return;

    try {
      const domRange = ReactEditor.toDOMRange(
        editor as ReactEditor,
        editor.selection
      );

      const rect = domRange.getBoundingClientRect();

      const editorContainer = ReactEditor.toDOMNode(
        editor as ReactEditor,
        editor.children[0]
      ).parentElement;

      if (!editorContainer) return;

      const editorRect = editorContainer.getBoundingClientRect();

      // Calculate the maximum x position
      const maxWidth = editorRect.width - 288; // 288px for w-72
      let x = rect.left - editorRect.left + editorContainer.scrollLeft;

      // Ensure x does not exceed the maximum width
      x = Math.min(x, maxWidth);

      return {
        x: x,
        y: rect.top - editorRect.top + editorContainer.scrollTop + 40,
      };
    } catch (error) {
      return;
    }
  }, [editor]);

  const currentAbsolutePosition = useMemo(() => {
    // This will only be recalculated when `editor.selection` changes
    return getSelectionAbsolutePosition();
  }, [editor.selection, getSelectionAbsolutePosition]);

  if (hidden) return null;

  const input = (
    <div className="flex w-[330px] flex-col">
      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Icons.link className="h-4 w-4" />
        </div>

        <FloatingLinkUrlInput
          className={inputVariants({ variant: 'ghost', h: 'sm' })}
          placeholder="Paste link"
        />
      </div>

      <Separator />

      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Icons.text className="h-4 w-4" />
        </div>
        <input
          className={inputVariants({ variant: 'ghost', h: 'sm' })}
          placeholder="Text to display"
          {...textInputProps}
        />
      </div>
    </div>
  );

  const editContent = editState.isEditing ? (
    input
  ) : (
    <div className="box-content flex h-9 items-center gap-1">
      <button
        type="button"
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        {...editButtonProps}
      >
        Edit link
      </button>

      <Separator orientation="vertical" />

      <LinkOpenButton
        className={buttonVariants({
          variant: 'ghost',
          size: 'sms',
        })}
      >
        <Icons.externalLink width={18} />
      </LinkOpenButton>

      <Separator orientation="vertical" />

      <button
        type="button"
        className={buttonVariants({
          variant: 'ghost',
          size: 'sms',
        })}
        {...unlinkButtonProps}
      >
        <Icons.unlink width={18} />
      </button>
    </div>
  );

  if (!currentAbsolutePosition) return null;

  return (
    <>
      <div
        ref={insertRef}
        className={cn(popoverVariants(), 'w-auto p-1')}
        style={{
          ...insertProps.style,
          top: currentAbsolutePosition.y,
          left: currentAbsolutePosition.x,
        }}
      >
        {input}
      </div>

      <div
        ref={editRef}
        className={cn(popoverVariants(), 'w-auto p-1')}
        style={{
          ...editProps.style,
          top: currentAbsolutePosition.y,
          left: currentAbsolutePosition.x,
        }}
      >
        {editContent}
      </div>
    </>
  );
}
