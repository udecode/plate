import React from 'react';
import {
  FloatingLink,
  LaunchIcon,
  LinkIcon,
  LinkOffIcon,
  ShortTextIcon,
} from '@udecode/plate-link';
import { PlateButton, plateButtonCss } from '@udecode/plate-ui-button';
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
  ${tw`flex flex-col bg-white !z-20`};

  border-radius: 4px;
  width: 330px;
  box-shadow: rgb(15 15 15 / 5%) 0 0 0 1px, rgb(15 15 15 / 10%) 0 3px 6px,
    rgb(15 15 15 / 20%) 0 9px 24px;
`;

const VerticalDivider = () => <div tw="w-px h-5 bg-gray-200 mx-2" />;

const buttonCss = [...plateButtonCss, tw`px-1`];

export const PlateFloatingLink = () => (
  <>
    <FloatingLink.InsertRoot css={floatingLinkRootCss}>
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
    </FloatingLink.InsertRoot>

    <FloatingLink.EditRoot
      css={[floatingLinkRootCss, tw`w-auto px-2 py-1 flex-row items-center`]}
    >
      <PlateButton>Edit link</PlateButton>

      <VerticalDivider />

      <FloatingLink.OpenLinkButton css={buttonCss}>
        <LaunchIcon width={18} />
      </FloatingLink.OpenLinkButton>

      <VerticalDivider />

      <FloatingLink.UnlinkButton css={buttonCss}>
        <LinkOffIcon width={18} />
      </FloatingLink.UnlinkButton>
    </FloatingLink.EditRoot>
  </>
);
