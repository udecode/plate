import React from 'react';
import { useElement } from '@udecode/plate-common';
import { LinkIcon } from '@udecode/plate-link';
import { FloatingMedia, useFloatingMediaSelectors } from '@udecode/plate-media';
import { cn } from '@udecode/plate-tailwind';

import { buttonVariants } from '@/plate/button/PlateButton';
import { RemoveNodeButton } from '@/plate/button/RemoveNodeButton';
import { floatingStyles } from '@/plate/toolbar/floatingStyles';
import { FloatingVerticalDivider } from '@/plate/toolbar/FloatingVerticalDivider';

export function PlateFloatingMedia({ pluginKey }: { pluginKey?: string }) {
  const isEditing = useFloatingMediaSelectors().isEditing();
  const element = useElement();

  return (
    <div className={floatingStyles.rootVariants()}>
      {!isEditing ? (
        <div className={cn(floatingStyles.rowVariants())}>
          <FloatingMedia.EditButton className={buttonVariants()}>
            Edit link
          </FloatingMedia.EditButton>

          <FloatingVerticalDivider />

          <RemoveNodeButton
            element={element}
            className={floatingStyles.buttonVariants()}
          />
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
