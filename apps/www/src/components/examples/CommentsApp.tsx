import React from 'react';
import { createCommentsPlugin, MARK_COMMENT } from '@udecode/plate-comments';
import { Plate, PlateProvider } from '@udecode/plate-common';

import { CommentLeaf } from '@/components/plate-ui/comment-leaf';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { CommentsProvider } from '@/plate/demo/comments/CommentsProvider';
import { editableProps } from '@/plate/demo/editableProps';
import { plateUI } from '@/plate/demo/plateUI';
import { basicNodesPlugins } from '@/plate/demo/plugins/basicNodesPlugins';
import { commentsValue } from '@/plate/demo/values/commentsValue';
import { createMyPlugins, MyValue } from '@/plate/plate.types';

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
