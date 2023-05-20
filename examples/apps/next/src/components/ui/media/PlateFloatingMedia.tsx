import React from 'react';
import { useElement } from '@udecode/plate-common';
import { LinkIcon } from '@udecode/plate-link';
import { FloatingMedia, useFloatingMediaSelectors } from '@udecode/plate-media';
import { cn } from '@udecode/plate-tailwind';
import { buttonVariants, RemoveNodeButton } from '@udecode/plate-ui-button';
import {
  floatingStyles,
  FloatingVerticalDivider,
} from '@udecode/plate-ui-toolbar';

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
