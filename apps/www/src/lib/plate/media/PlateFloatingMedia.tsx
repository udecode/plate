import React from 'react';
import { useElement } from '@udecode/plate-common';
import { LinkIcon } from '@udecode/plate-link';
import { FloatingMedia, useFloatingMediaSelectors } from '@udecode/plate-media';
import { cn } from '@udecode/plate-tailwind';

import { Icons } from '@/components/icons';
import { Button, buttonVariants } from '@/components/ui/button';
import { useRemoveNodeButtonProps } from '@/plate/common/useRemoveNodeButtonProps';
import { floatingStyles } from '@/plate/toolbar/floatingStyles';
import { FloatingVerticalDivider } from '@/plate/toolbar/FloatingVerticalDivider';

export function PlateFloatingMedia({ pluginKey }: { pluginKey?: string }) {
  const isEditing = useFloatingMediaSelectors().isEditing();
  const element = useElement();
  const removeNodeButtonProps = useRemoveNodeButtonProps({ element });

  return (
    <div className={floatingStyles.rootVariants()}>
      {!isEditing ? (
        <div className={cn(floatingStyles.rowVariants())}>
          <FloatingMedia.EditButton
            className={buttonVariants({ variant: 'ghost' })}
          >
            Edit link
          </FloatingMedia.EditButton>

          <FloatingVerticalDivider />

          <Button
            className={floatingStyles.buttonVariants()}
            {...removeNodeButtonProps}
          >
            <Icons.delete className="mr-2 h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex w-[330px] flex-col">
          <div className={floatingStyles.inputVariants()}>
            <div className={floatingStyles.iconWrapperVariants()}>
              <LinkIcon width={18} />
            </div>

            <FloatingMedia.UrlInput
              className={floatingStyles.inputVariants()}
              placeholder="Paste the embed link..."
              pluginKey={pluginKey}
            />
          </div>
        </div>
      )}
    </div>
  );
}
