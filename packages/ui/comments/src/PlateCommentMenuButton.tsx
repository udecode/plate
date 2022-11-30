import React from 'react';
import {
  CommentDeleteButton,
  CommentEditButton,
  MoreVertIcon,
  useCommentActions,
  useCommentSelectors,
} from '@udecode/plate-comments';
import { PlateButton, plateButtonCss } from '@udecode/plate-ui-button';
import { floatingRootCss, ToolbarDropdown } from '@udecode/plate-ui-toolbar';
import { css } from 'styled-components';
import tw from 'twin.macro';

export const PlateCommentMenuButton = () => {
  const isMenuOpen = useCommentSelectors().isMenuOpen();
  const setIsMenuOpen = useCommentActions().isMenuOpen();

  return (
    <div>
      <ToolbarDropdown
        control={
          <PlateButton css={tw`p-1`}>
            <MoreVertIcon tw="w-6 h-6 text-gray-500" />
          </PlateButton>
        }
        open={isMenuOpen}
        onOpen={() => setIsMenuOpen(true)}
        onClose={() => setIsMenuOpen(false)}
      >
        <div
          tw="flex flex-col relative"
          css={[
            floatingRootCss,
            css`
              width: 150px;
            `,
          ]}
        >
          <CommentEditButton
            css={[plateButtonCss, tw`justify-start px-4 py-2`]}
          >
            Edit comment
          </CommentEditButton>

          <CommentDeleteButton
            css={[plateButtonCss, tw`justify-start px-4 py-2`]}
          >
            Delete comment
          </CommentDeleteButton>
        </div>
      </ToolbarDropdown>
    </div>
  );
};
