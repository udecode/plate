import React from 'react';
import { useElement, useRemoveNodeButtonProps } from '@udecode/plate-common';
import {
  FloatingMedia as FloatingMediaPrimitive,
  useFloatingMediaSelectors,
} from '@udecode/plate-media';
import { cn } from '@udecode/plate-tailwind';

import { Icons } from '@/components/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import { inputVariants } from '@/components/ui/input';
import { popoverVariants } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

export function FloatingMedia({ pluginKey }: { pluginKey?: string }) {
  const isEditing = useFloatingMediaSelectors().isEditing();
  const element = useElement();
  const removeNodeButtonProps = useRemoveNodeButtonProps({ element });

  return (
    <div className={cn(popoverVariants(), 'w-auto p-1')}>
      {!isEditing ? (
        <div className="box-content flex h-9 items-center gap-1">
          <FloatingMediaPrimitive.EditButton
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            Edit link
          </FloatingMediaPrimitive.EditButton>

          <Separator orientation="vertical" className="my-1" />

          <Button variant="ghost" size="sms" {...removeNodeButtonProps}>
            <Icons.delete className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex w-[330px] flex-col">
          <div className="flex items-center">
            <div className="flex items-center pl-3 text-muted-foreground">
              <Icons.link className="h-4 w-4" />
            </div>

            <FloatingMediaPrimitive.UrlInput
              className={inputVariants({ variant: 'ghost', h: 'sm' })}
              placeholder="Paste the embed link..."
              pluginKey={pluginKey}
            />
          </div>
        </div>
      )}
    </div>
  );
}
