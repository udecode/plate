import React from 'react';
import { useElement } from '@udecode/plate-common';
import { LinkIcon } from '@udecode/plate-link';
import { FloatingMedia, useFloatingMediaSelectors } from '@udecode/plate-media';
import { cn } from '@udecode/plate-styled-components';
import { buttonVariants, RemoveNodeButton } from '@udecode/plate-ui-button';
import {
  floatingVariants,
  FloatingVerticalDivider,
} from '@udecode/plate-ui-toolbar';

export const PlateFloatingMedia = ({ pluginKey }: { pluginKey?: string }) => {
  const isEditing = useFloatingMediaSelectors().isEditing();
  const element = useElement();

  return (
    <div className={cn(floatingVariants({ element: 'root' }))}>
      {!isEditing ? (
        <div className={cn(floatingVariants({ element: 'row' }))}>
          <FloatingMedia.EditButton className={buttonVariants()}>
            Edit link
          </FloatingMedia.EditButton>

          <FloatingVerticalDivider />

          <RemoveNodeButton
            element={element}
            className={floatingVariants({ element: 'button' })}
          />
        </div>
      ) : (
        <div className="flex w-[330px] flex-col">
          <div className={floatingVariants({ element: 'inputWrapper' })}>
            <div className={floatingVariants({ element: 'iconWrapper' })}>
              <LinkIcon width={18} />
            </div>

            <FloatingMedia.UrlInput
              className={floatingVariants({ element: 'input' })}
              placeholder="Paste the embed link..."
              pluginKey={pluginKey}
            />
          </div>
        </div>
      )}
    </div>
  );
};
