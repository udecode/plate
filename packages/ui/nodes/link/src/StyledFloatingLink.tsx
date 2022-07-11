import React from 'react';
import { RenderAfterEditableProps } from '@udecode/plate-core';
import { FloatingLink, LinkIcon, ShortTextIcon } from '@udecode/plate-link';
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

export const StyledFloatingLink = (props: RenderAfterEditableProps) => (
  <FloatingLink.Root
    {...props}
    css={[
      tw`flex flex-col bg-white !z-20`,
      css`
        border-radius: 4px;
        width: 330px;
        box-shadow: rgb(15 15 15 / 5%) 0 0 0 1px, rgb(15 15 15 / 10%) 0 3px 6px,
          rgb(15 15 15 / 20%) 0 9px 24px;
      `,
    ]}
  >
    <InputWrapper>
      <IconWrapper>
        <LinkIcon width={18} />
      </IconWrapper>

      <FloatingLink.UrlInput css={inputCss} placeholder="Paste link" />
    </InputWrapper>

    <div css={tw`h-px bg-gray-200`} />

    <InputWrapper>
      <IconWrapper>
        <ShortTextIcon width={18} />
      </IconWrapper>
      <FloatingLink.TextInput css={inputCss} placeholder="Text to display" />
    </InputWrapper>
  </FloatingLink.Root>
);
