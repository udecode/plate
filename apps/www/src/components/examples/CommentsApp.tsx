import React from 'react';
import {
  createCommentsPlugin,
  MARK_COMMENT,
  Plate,
  PlateProvider,
} from '@udecode/plate';

import { basicNodesPlugins } from '@/plate/basic-nodes/basicNodesPlugins';
import { commentsValue } from '@/plate/comments/constants';
import { FloatingComments } from '@/plate/comments/FloatingComments';
import { MyCommentsProvider } from '@/plate/comments/MyCommentsProvider';
import { PlateCommentLeaf } from '@/plate/comments/PlateCommentLeaf';
import { editableProps } from '@/plate/common/editableProps';
import { plateUI } from '@/plate/common/plateUI';
import { BalloonToolbarButtons } from '@/plate/toolbar/BalloonToolbarButtons';
import { createMyPlugins, MyValue } from '@/plate/typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createCommentsPlugin()],
  {
    components: {
      ...plateUI,
      [MARK_COMMENT]: PlateCommentLeaf,
    },
  }
);

export default function CommentsApp() {
  return (
    <PlateProvider plugins={plugins} initialValue={commentsValue}>
      <MyCommentsProvider>
        <Plate<MyValue> editableProps={editableProps}>
          <BalloonToolbarButtons />
        </Plate>

        <FloatingComments />
      </MyCommentsProvider>
    </PlateProvider>
  );
}
