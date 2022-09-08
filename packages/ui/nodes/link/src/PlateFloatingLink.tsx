import {
  FloatingLink,
  LaunchIcon,
  LinkIcon,
  LinkOffIcon,
  ShortTextIcon,
  useFloatingLinkSelectors,
} from '@udecode/plate-link';
import { plateButtonCss } from '@udecode/plate-ui-button';
import {
  floatingButtonCss,
  FloatingIconWrapper,
  floatingInputCss,
  FloatingInputWrapper,
  floatingLabelCss,
  floatingRootCss,
  floatingRowCss,
  FloatingVerticalDivider,
} from '@udecode/plate-ui-toolbar';
import React from 'react';

export const PlateFloatingLink = () => {
  const isEditing = useFloatingLinkSelectors().isEditing();

  const input = (
    <div tw="flex flex-col w-[330px]">
      <FloatingInputWrapper>
        <FloatingIconWrapper>
          <LinkIcon width={18} />
        </FloatingIconWrapper>

        <FloatingLink.UrlInput
          css={floatingInputCss}
          placeholder="Paste link"
        />
      </FloatingInputWrapper>

      <div tw="h-px bg-gray-200" />

      <FloatingInputWrapper>
        <FloatingIconWrapper>
          <ShortTextIcon width={18} />
        </FloatingIconWrapper>
        <FloatingLink.TextInput
          css={floatingInputCss}
          placeholder="Text to display"
        />
      </FloatingInputWrapper>
      <div tw="h-px bg-gray-200" />

      <FloatingInputWrapper>
        <FloatingIconWrapper>
          <FloatingLink.NewTabInput />
        </FloatingIconWrapper>
        <label css={floatingLabelCss}>Open link in new tab</label>
      </FloatingInputWrapper>
    </div>
  );

  const editContent = !isEditing ? (
    <div css={floatingRowCss}>
      <FloatingLink.EditButton css={plateButtonCss}>
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
      <FloatingLink.InsertRoot css={floatingRootCss}>
        {input}
      </FloatingLink.InsertRoot>

      <FloatingLink.EditRoot css={floatingRootCss}>
        {editContent}
      </FloatingLink.EditRoot>
    </>
  );
};
