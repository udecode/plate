import React from 'react';
import {
  createCommentsPlugin,
  MARK_COMMENT,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { CommentLeaf } from '@/plate/comments/CommentLeaf';
import { commentsValue } from '@/plate/comments/constants';
import { FloatingCommentList } from '@/plate/comments/FloatingCommentList';
import { MyCommentsProvider } from '@/plate/comments/MyCommentsProvider';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { FloatingToolbarButtons } from '@/plate/toolbar/FloatingToolbarButtons';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createCommentsPlugin()],
  {
    components: {
      ...plateUI,
      [MARK_COMMENT]: CommentLeaf,
    },
  }
);

export default function CommentsApp() {
  return (
    <PlateProvider plugins={plugins} initialValue={commentsValue}>
      <MyCommentsProvider>
        <Plate<MyValue> editableProps={editableProps}>
          <FloatingToolbarButtons />
        </Plate>

        <FloatingCommentList />
      </MyCommentsProvider>
    </PlateProvider>
  );
}
