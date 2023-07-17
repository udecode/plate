import React from 'react';
import { TEditableProps } from '@udecode/plate-common';
import {
  FloatingLinkUrlInput,
  LinkOpenButton,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
  useFloatingLinkSelectors,
} from '@udecode/plate-link';

import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

import { buttonVariants } from './button';
import { inputVariants } from './input';
import { popoverVariants } from './popover';
import { Separator } from './separator';

export function LinkFloatingToolbar({ readOnly }: TEditableProps) {
  const isEditing = useFloatingLinkSelectors().isEditing();

  const state = useFloatingLinkInsertState();
  const {
    props: insertProps,
    ref: insertRef,
    textInputProps,
  } = useFloatingLinkInsert(state);

  const editState = useFloatingLinkEditState();
  const {
    props: editProps,
    ref: editRef,
    editButtonProps,
    unlinkButtonProps,
  } = useFloatingLinkEdit(editState);

  if (readOnly) return null;

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

  const editContent = isEditing ? (
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

  return (
    <>
      <div
        ref={insertRef}
        className={cn(popoverVariants(), 'w-auto p-1')}
        {...insertProps}
      >
        {input}
      </div>

      <div
        ref={editRef}
        className={cn(popoverVariants(), 'w-auto p-1')}
        {...editProps}
      >
        {editContent}
      </div>
    </>
  );
}
