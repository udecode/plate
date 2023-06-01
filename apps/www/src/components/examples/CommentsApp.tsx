import React from 'react';
import {
  createCommentsPlugin,
  MARK_COMMENT,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { CommentLeaf } from '@/plate/bcomponents/comments/CommentLeaf';
import { CommentsProvider } from '@/plate/bcomponents/comments/CommentsProvider';
import { FloatingComments } from '@/plate/bcomponents/comments/FloatingComments';
import { FloatingToolbarButtons } from '@/plate/bcomponents/floating-toolbar-buttons';
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

        <FloatingComments />
      </CommentsProvider>
    </PlateProvider>
  );
}
