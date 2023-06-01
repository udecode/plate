import React from 'react';
import { TEditableProps } from '@udecode/plate-common';
import {
  FloatingLink as FloatingLinkPrimitive,
  useFloatingLinkSelectors,
} from '@udecode/plate-link';

import { Icons } from '@/components/icons';
import { buttonVariants } from '@/components/ui/button';
import { inputVariants } from '@/components/ui/input';
import { popoverVariants } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export function FloatingLink({ readOnly }: TEditableProps) {
  const isEditing = useFloatingLinkSelectors().isEditing();

  if (readOnly) return null;

  const input = (
    <div className="flex w-[330px] flex-col">
      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Icons.link className="h-4 w-4" />
        </div>

        <FloatingLinkPrimitive.UrlInput
          className={inputVariants({ variant: 'ghost', h: 'sm' })}
          placeholder="Paste link"
        />
      </div>

      <Separator />

      <div className="flex items-center">
        <div className="flex items-center pl-3 text-muted-foreground">
          <Icons.text className="h-4 w-4" />
        </div>
        <FloatingLinkPrimitive.TextInput
          className={inputVariants({ variant: 'ghost', h: 'sm' })}
          placeholder="Text to display"
        />
      </div>
    </div>
  );

  const editContent = !isEditing ? (
    <div className="box-content flex h-9 items-center gap-1">
      <FloatingLinkPrimitive.EditButton
        className={buttonVariants({ variant: 'ghost', size: 'sm' })}
      >
        Edit link
      </FloatingLinkPrimitive.EditButton>

      <Separator orientation="vertical" />

      <FloatingLinkPrimitive.OpenLinkButton
        className={buttonVariants({
          variant: 'ghost',
          size: 'sms',
        })}
      >
        <Icons.externalLink width={18} />
      </FloatingLinkPrimitive.OpenLinkButton>

      <Separator orientation="vertical" />

      <FloatingLinkPrimitive.UnlinkButton
        className={buttonVariants({
          variant: 'ghost',
          size: 'sms',
        })}
      >
        <Icons.unlink width={18} />
      </FloatingLinkPrimitive.UnlinkButton>
    </div>
  ) : (
    input
  );

  return (
    <>
      <FloatingLinkPrimitive.InsertRoot
        className={cn(popoverVariants(), 'w-auto p-1')}
      >
        {input}
      </FloatingLinkPrimitive.InsertRoot>

      <FloatingLinkPrimitive.EditRoot
        className={cn(popoverVariants(), 'w-auto p-1')}
      >
        {editContent}
      </FloatingLinkPrimitive.EditRoot>
    </>
  );
}
