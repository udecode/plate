import React from 'react';
import { useElement } from '@udecode/plate-common';
import { LinkIcon } from '@udecode/plate-link';
import { FloatingMedia, useFloatingMediaSelectors } from '@udecode/plate-media';
import { cn } from '@udecode/plate-styled-components';
import { buttonVariants, RemoveNodeButton } from '@udecode/plate-ui-button';
import {
  floatingButtonCss,
  FloatingIconWrapper,
  floatingInputCss,
  FloatingInputWrapper,
  floatingRowCss,
  floatingVariants,
  FloatingVerticalDivider,
} from '@udecode/plate-ui-toolbar';

export const PlateFloatingMedia = ({ pluginKey }: { pluginKey?: string }) => {
  const isEditing = useFloatingMediaSelectors().isEditing();
  const element = useElement();

  return (
    <div className={cn(floatingVariants({ type: 'root' }))}>
      {!isEditing ? (
        <div css={floatingRowCss}>
          <FloatingMedia.EditButton className={buttonVariants()}>
            Edit link
          </FloatingMedia.EditButton>

          <FloatingVerticalDivider />

          <RemoveNodeButton element={element} css={floatingButtonCss} />
        </div>
      ) : (
        <div className="flex w-[330px] flex-col">
          <FloatingInputWrapper>
            <FloatingIconWrapper>
              <LinkIcon width={18} />
            </FloatingIconWrapper>

            <FloatingMedia.UrlInput
              css={floatingInputCss}
              placeholder="Paste the embed link..."
              pluginKey={pluginKey}
            />
          </FloatingInputWrapper>
        </div>
      )}
    </div>
  );
};
