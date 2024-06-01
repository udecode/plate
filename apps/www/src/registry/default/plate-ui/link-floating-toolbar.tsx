'use client';

import React from 'react';
import { cn } from '@udecode/cn';
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
import { useFormInputProps } from '@udecode/plate-utils';

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
  preventDefaultOnEnterKeydown?: boolean;
  onKeyDownCaptureCallback?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function LinkFloatingToolbar({
  state,
  preventDefaultOnEnterKeydown,
  onKeyDownCaptureCallback,
}: LinkFloatingToolbarProps) {
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
  const inputProps = useFormInputProps({
    preventDefaultOnEnterKeydown,
    onKeyDownCaptureCallback,
  });

  if (hidden) return null;

  const input = (
    <div className="flex w-[330px] flex-col">
      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Icons.link className="size-4" />
        </div>

        <FloatingLinkUrlInput
          className={inputVariants({ variant: 'ghost', h: 'sm' })}
          placeholder="Paste link"
          {...inputProps}
        />
      </div>
      <Separator />
      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Icons.text className="size-4" />
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
