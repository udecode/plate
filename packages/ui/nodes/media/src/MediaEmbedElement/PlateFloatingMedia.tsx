import React from 'react';
import { useElement } from '@udecode/plate-core';
import { LinkIcon } from '@udecode/plate-link';
import { FloatingMedia, useFloatingMediaSelectors } from '@udecode/plate-media';
import {
  plateButtonCss,
  PlateRemoveNodeButton,
} from '@udecode/plate-ui-button';
import {
  floatingButtonCss,
  FloatingIconWrapper,
  floatingInputCss,
  FloatingInputWrapper,
  floatingRootCss,
  floatingRowCss,
  FloatingVerticalDivider,
} from '@udecode/plate-ui-toolbar';

export const PlateFloatingMedia = ({ pluginKey }: { pluginKey?: string }) => {
  const isEditing = useFloatingMediaSelectors().isEditing();
  const element = useElement();

  return (
    <div css={floatingRootCss}>
      {!isEditing ? (
        <div css={floatingRowCss}>
          <FloatingMedia.EditButton css={plateButtonCss}>
            Edit link
          </FloatingMedia.EditButton>

          <FloatingVerticalDivider />

          <PlateRemoveNodeButton element={element} css={floatingButtonCss} />
        </div>
      ) : (
        <div tw="flex flex-col w-[330px]">
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
