import React, { useEffect, useRef } from 'react';
import { PlateButton } from '@udecode/plate-ui-button';
import { floatingRootCss, ToolbarDropdown } from '@udecode/plate-ui-toolbar';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { useCommentActions, useCommentSelectors } from '../CommentProvider';
import { useCommentsActions } from '../CommentsProvider';
import { DeleteCommentButton } from './DeleteCommentButton';
import { EditCommentButton } from './EditCommentButton';
import { MoreVertIcon } from './MoreVertIcon';

export const menuButtonCss = css`
  ${tw`p-1`};
`;

export const menuButtonItemCss = css`
  ${tw`w-full h-full`};
`;

export const PlateCommentMenuButton = () => {
  const setMenuRef = useCommentsActions().menuRef();
  const isMenuOpen = useCommentSelectors().isMenuOpen();
  const setIsMenuOpen = useCommentActions().isMenuOpen();

  const ref = useRef(null);

  useEffect(() => {
    setMenuRef(ref);
  }, [setMenuRef]);

  return (
    <div>
      <ToolbarDropdown
        control={
          <PlateButton css={menuButtonCss}>
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
          <EditCommentButton tw="justify-start px-4 py-2">
            Edit comment
          </EditCommentButton>

          <DeleteCommentButton tw="justify-start px-4 py-2">
            Delete comment
          </DeleteCommentButton>
        </div>
      </ToolbarDropdown>
    </div>
  );
};
