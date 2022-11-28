import React from 'react';
import { AddComment } from '@styled-icons/material';
import { Plate, PlateProvider } from '@udecode/plate';
import { createCommentsPlugin, MARK_COMMENT } from '@udecode/plate-comments';
import {
  CommentToolbarButton,
  PlateCommentLeaf,
} from '@udecode/plate-ui-comments';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { Comments } from './comments/Comments';
import { commentsValue } from './comments/constants';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [
    ...basicNodesPlugins,
    createCommentsPlugin({
      renderAfterEditable: () => <Comments />,
    }),
  ],
  {
    components: {
      ...plateUI,
      [MARK_COMMENT]: PlateCommentLeaf,
    },
  }
);

export default () => {
  return (
    <PlateProvider plugins={plugins} initialValue={commentsValue}>
      <Toolbar>
        <CommentToolbarButton icon={<AddComment />} />
        {/* <ToggleShowThreadsButton icon={<Comment />} /> */}
      </Toolbar>

      <Plate<MyValue> editableProps={editableProps} />
    </PlateProvider>
  );
};
