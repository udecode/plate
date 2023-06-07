import React from 'react';
import { useElement, useRemoveNodeButton } from '@udecode/plate-common';
import { flip, offset, PopoverProps, shift } from '@udecode/plate-floating';
import {
  FloatingMedia as FloatingMediaPrimitive,
  useFloatingMediaSelectors,
} from '@udecode/plate-media';

import { Icons } from '@/components/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import { inputVariants } from '@/components/ui/input';
import { popoverVariants } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export const mediaFloatingOptions: PopoverProps['floatingOptions'] = {
  middleware: [
    offset(-6),
    flip({
      padding: 96,
    }),
    shift(),
  ],
};

export function MediaFloatingToolbar({ pluginKey }: { pluginKey?: string }) {
  const isEditing = useFloatingMediaSelectors().isEditing();
  const element = useElement();
  const { props: buttonProps } = useRemoveNodeButton({ element });

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

          <Button variant="ghost" size="sms" {...buttonProps}>
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
              options={{
                pluginKey,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
