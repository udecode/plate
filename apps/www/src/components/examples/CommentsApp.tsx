import React from 'react';
import {
  createCommentsPlugin,
  MARK_COMMENT,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { CommentLeaf } from '@/plate/aui/comment-leaf';
import { CommentsPopover } from '@/plate/aui/comments-popover';
import { FloatingToolbarButtons } from '@/plate/aui/floating-toolbar-buttons';
import { CommentsProvider } from '@/plate/demo/CommentsProvider';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { commentsValue } from '@/plate/demo/values/commentsValue';
import { createMyPlugins, MyValue } from '@/types/plate.types';

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

        <CommentsPopover />
      </CommentsProvider>
    </PlateProvider>
  );
}
