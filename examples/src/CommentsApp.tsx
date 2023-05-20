import React from 'react';
import {
  createCommentsPlugin,
  MARK_COMMENT,
  Plate,
  PlateCommentLeaf,
  PlateFloatingComments,
  PlateProvider,
} from '@udecode/plate';
import {
  createMyPlugins,
  MyValue,
} from 'examples-next/src/lib/plate/typescript/plateTypes';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { CommentBalloonToolbar } from './comments/CommentBalloonToolbar';
import { commentsValue } from './comments/constants';
import { MyCommentsProvider } from './comments/MyCommentsProvider';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';

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
          <CommentBalloonToolbar />
        </Plate>

        <PlateFloatingComments />
      </MyCommentsProvider>
    </PlateProvider>
  );
}
