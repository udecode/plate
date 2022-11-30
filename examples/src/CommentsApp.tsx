import React from 'react';
import { AddComment } from '@styled-icons/material';
import {
  createCommentsPlugin,
  MARK_COMMENT,
  Plate,
  PlateCommentLeaf,
  PlateCommentToolbarButton,
  PlateProvider,
} from '@udecode/plate';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { Comments } from './comments/Comments';
import { commentsValue } from './comments/constants';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins(
  [...basicNodesPlugins, createCommentsPlugin()],
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
      <Comments>
        <Toolbar>
          <PlateCommentToolbarButton icon={<AddComment />} />
          {/* <ToggleShowThreadsButton icon={<Comment />} /> */}
        </Toolbar>

        <Plate<MyValue> editableProps={editableProps} />
      </Comments>
    </PlateProvider>
  );
};
