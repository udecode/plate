import React, { useState } from 'react';
import { AddComment, Comment } from '@styled-icons/material';
import { Plate } from '@udecode/plate';
import { createThreadPlugin, ELEMENT_THREAD } from '@udecode/plate-comments';
import {
  AddThreadToolbarButton,
  PlateThreadNode,
  ToggleShowThreadsButton,
} from '@udecode/plate-ui-comments';
import { basicNodesPlugins } from './basic-nodes/basicNodesPlugins';
import { Comments, commentUser } from './comments/Comments';
import { commentsValue } from './comments/commentsValue';
import { editableProps } from './common/editableProps';
import { plateUI } from './common/plateUI';
import { Toolbar } from './toolbar/Toolbar';
import { createMyPlugins, MyValue } from './typescript/plateTypes';

const plugins = createMyPlugins([...basicNodesPlugins, createThreadPlugin()], {
  components: {
    ...plateUI,
    [ELEMENT_THREAD]: PlateThreadNode,
  },
});

export default () => {
  const [commentActions, setCommentActions] = useState<any>();

  return (
    <>
      <Toolbar>
        {commentActions?.onAddThread ? (
          <AddThreadToolbarButton
            icon={<AddComment />}
            onAddThread={commentActions.onAddThread}
          />
        ) : null}

        <ToggleShowThreadsButton
          fetchContacts={() => [commentUser]}
          retrieveUser={() => commentUser}
          icon={<Comment />}
        />
      </Toolbar>

      <Plate<MyValue>
        editableProps={editableProps}
        plugins={plugins}
        initialValue={commentsValue}
      >
        <Comments setCommentActions={setCommentActions} />
      </Plate>
    </>
  );
};
