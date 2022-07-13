import React from 'react';
import {
  FloatingLink,
  LaunchIcon,
  LinkIcon,
  LinkOffIcon,
  ShortTextIcon,
  useFloatingLinkSelectors,
} from '@udecode/plate-link';
import { plateButtonCss } from '@udecode/plate-ui-button';
import styled, { css } from 'styled-components';
import tw from 'twin.macro';

const IconWrapper = styled.div`
  ${tw`flex items-center px-2 text-gray-400`};
`;

const InputWrapper = styled.div`
  ${tw`flex items-center py-1`};
`;

const inputCss = [
  tw`border-none bg-transparent h-8 flex-grow p-0`,
  tw`focus:outline-none`,
  css`
    line-height: 20px;
  `,
];

export const floatingLinkRootCss = css`
  ${tw`bg-white !z-20`};

  border-radius: 4px;
  box-shadow: rgb(15 15 15 / 5%) 0 0 0 1px, rgb(15 15 15 / 10%) 0 3px 6px,
    rgb(15 15 15 / 20%) 0 9px 24px;
`;

const VerticalDivider = () => <div tw="w-px h-5 bg-gray-200 mx-2" />;

const buttonCss = [...plateButtonCss, tw`px-1`];

export const PlateFloatingLink = () => {
  const isEditing = useFloatingLinkSelectors().isEditing();

  const input = (
    <div tw="flex flex-col w-[330px]">
      <InputWrapper>
        <IconWrapper>
          <LinkIcon width={18} />
        </IconWrapper>

        <FloatingLink.UrlInput css={inputCss} placeholder="Paste link" />
      </InputWrapper>

      <div tw="h-px bg-gray-200" />

      <InputWrapper>
        <IconWrapper>
          <ShortTextIcon width={18} />
        </IconWrapper>
        <FloatingLink.TextInput css={inputCss} placeholder="Text to display" />
      </InputWrapper>
    </div>
  );

  const editContent = !isEditing ? (
    <div tw="w-auto px-2 py-1 flex flex-row items-center">
      <FloatingLink.EditButton css={plateButtonCss}>
        Edit link
      </FloatingLink.EditButton>

      <VerticalDivider />

      <FloatingLink.OpenLinkButton css={buttonCss}>
        <LaunchIcon width={18} />
      </FloatingLink.OpenLinkButton>

      <VerticalDivider />

      <FloatingLink.UnlinkButton css={buttonCss}>
        <LinkOffIcon width={18} />
      </FloatingLink.UnlinkButton>
    </div>
  ) : (
    input
  );

  return (
    <>
      <FloatingLink.InsertRoot css={floatingLinkRootCss}>
        {input}
      </FloatingLink.InsertRoot>

      <FloatingLink.EditRoot css={[floatingLinkRootCss, tw`w-auto`]}>
        {editContent}
      </FloatingLink.EditRoot>
    </>
  );
};
