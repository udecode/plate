import React, { useState } from 'react';
import { AddComment, Comment } from '@styled-icons/material';
import { createThreadPlugin, ELEMENT_THREAD } from '@udecode/plate-comments';
import { createPlugins, Plate } from '@udecode/plate-core';
import { createPlateUI } from '@udecode/plate-ui';
import {
  AddThreadToolbarButton,
  PlateThreadNode,
  ToggleShowThreadsButton,
} from '@udecode/plate-ui-comments';
import { Comments } from './comments/Comments';
import { commentsValue } from './comments/commentsValue';
import { Toolbar } from './toolbar/Toolbar';

const components = createPlateUI({
  [ELEMENT_THREAD]: PlateThreadNode,
});

const plugins = createPlugins([...[createThreadPlugin()]], {
  components,
});

const user = {
  id: '1',
  name: 'John Doe',
  email: 'osama@gmail.com',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1863771?v=4',
};

export default () => {
  const [commentActions, setCommentActions] = useState<any>();

  return (
    <div>
      <Toolbar>
        {commentActions?.onAddThread ? (
          <AddThreadToolbarButton
            icon={<AddComment />}
            onAddThread={commentActions.onAddThread}
          />
        ) : null}
        <ToggleShowThreadsButton
          fetchContacts={() => [user]}
          retrieveUser={() => user}
          icon={<Comment />}
        />
      </Toolbar>
      <Plate
        id="main"
        editableProps={{
          placeholder: 'Enter some plain text...',
        }}
        initialValue={commentsValue}
        plugins={plugins}
        onChange={(value) => console.log(JSON.stringify(value))}
      >
        <Comments setCommentActions={setCommentActions} />
      </Plate>
    </div>
  );
};
