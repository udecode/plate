import React from 'react';
import {
  createCommentsPlugin,
  MARK_COMMENT,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { CommentLeaf } from '@/plate/comments/CommentLeaf';
import { FloatingCommentList } from '@/plate/comments/FloatingCommentList';
import { MyCommentsProvider } from '@/plate/comments/MyCommentsProvider';
import { editableProps } from '@/plate/demo/editableProps';
import { createMyPlugins, MyValue } from '@/plate/demo/plate.types';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { commentsValue } from '@/plate/demo/values/commentsValue';
import { FloatingToolbarButtons } from '@/plate/toolbar/FloatingToolbarButtons';

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
      <CommentsProvider>
        <Plate<MyValue> editableProps={editableProps}>
          <FloatingToolbarButtons />
        </Plate>

        <FloatingComments />
      </CommentsProvider>
    </PlateProvider>
  );
}
