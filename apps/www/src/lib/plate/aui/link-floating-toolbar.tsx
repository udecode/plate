import React from 'react';
import {
  FloatingLinkUrlInput,
  useFloatingLinkEdit,
  useFloatingLinkEditState,
  useFloatingLinkInsert,
  useFloatingLinkInsertState,
} from '@udecode/plate';
import { TEditableProps } from '@udecode/plate-common';
import { LinkOpenButton, useFloatingLinkSelectors } from '@udecode/plate-link';

import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { inputVariants } from '@/components/ui/input';
import { popoverVariants } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

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

  const editContent = !isEditing ? (
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
  ) : (
    input
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
