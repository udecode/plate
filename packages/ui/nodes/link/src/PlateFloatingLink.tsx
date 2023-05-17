import React from 'react';
import { TEditableProps } from '@udecode/plate-common';
import {
  FloatingLink,
  LaunchIcon,
  LinkIcon,
  LinkOffIcon,
  ShortTextIcon,
  useFloatingLinkSelectors,
} from '@udecode/plate-link';
import { cn } from '@udecode/plate-styled-components';
import { buttonVariants } from '@udecode/plate-ui-button';
import {
  floatingButtonCss,
  FloatingIconWrapper,
  floatingInputCss,
  FloatingInputWrapper,
  floatingRowCss,
  floatingVariants,
  FloatingVerticalDivider,
} from '@udecode/plate-ui-toolbar';

export const PlateFloatingLink = ({ readOnly }: TEditableProps) => {
  const isEditing = useFloatingLinkSelectors().isEditing();

  if (readOnly) return null;

  const input = (
    <div className="flex w-[330px] flex-col">
      <FloatingInputWrapper>
        <FloatingIconWrapper>
          <LinkIcon width={18} />
        </FloatingIconWrapper>

        <FloatingLink.UrlInput
          css={floatingInputCss}
          placeholder="Paste link"
        />
      </FloatingInputWrapper>

      <div className="h-px bg-gray-200" />

      <FloatingInputWrapper>
        <FloatingIconWrapper>
          <ShortTextIcon width={18} />
        </FloatingIconWrapper>
        <FloatingLink.TextInput
          css={floatingInputCss}
          placeholder="Text to display"
        />
      </FloatingInputWrapper>
    </div>
  );

  const editContent = !isEditing ? (
    <div css={floatingRowCss}>
      <FloatingLink.EditButton className={buttonVariants()}>
        Edit link
      </FloatingLink.EditButton>

      <FloatingVerticalDivider />

      <FloatingLink.OpenLinkButton css={floatingButtonCss}>
        <LaunchIcon width={18} />
      </FloatingLink.OpenLinkButton>

      <FloatingVerticalDivider />

      <FloatingLink.UnlinkButton css={floatingButtonCss}>
        <LinkOffIcon width={18} />
      </FloatingLink.UnlinkButton>
    </div>
  ) : (
    input
  );

  return (
    <>
      <FloatingLink.InsertRoot
        className={cn(floatingVariants({ type: 'root' }))}
      >
        {input}
      </FloatingLink.InsertRoot>

      <FloatingLink.EditRoot className={cn(floatingVariants({ type: 'root' }))}>
        {editContent}
      </FloatingLink.EditRoot>
    </>
  );
};
