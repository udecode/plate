import React, { useState } from 'react';
import { render } from 'react-dom';
import { AddComment, Comment } from '@styled-icons/material';
import { createPlugins, Plate } from '@udecode/plate-core';
import { createPlateUI } from '@udecode/plate-ui';
import { initialValue } from './initialValue';
import {
  AddThreadToolbarButton,
  Comments,
  createThreadPlugin,
  ELEMENT_THREAD,
  PlateThreadNode,
  ToggleShowThreadsButton,
} from './src';

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

const App = () => {
  const [commentActions, setCommentActions] = useState<any>();

  return (
    <div>
      {commentActions?.onAddThread && (
        <AddThreadToolbarButton
          icon={<AddComment />}
          onAddThread={commentActions.onAddThread}
        />
      )}
      <ToggleShowThreadsButton
        fetchContacts={() => [user]}
        retrieveUser={() => user}
        icon={<Comment />}
      />
      <Plate
        id="main"
        editableProps={{
          placeholder: 'Enter some plain text...',
        }}
        initialValue={initialValue}
        plugins={plugins}
        onChange={(value) => console.log(JSON.stringify(value))}
      >
        <Comments setCommentActions={setCommentActions} />
      </Plate>
    </div>
  );
};

render(<App />, document.getElementById('root'));
