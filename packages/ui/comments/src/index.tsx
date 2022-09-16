import React, { useState } from 'react';
import { render } from 'react-dom';
import { AddComment } from '@styled-icons/material';
import { createPlugins, Plate } from '@udecode/plate-core';
import { createPlateUI } from '@udecode/plate-ui';
import { AddThreadToolbarButton } from './components/AddThreadToolbarButton';
import { ThreadElement } from './components/ThreadElement';
import { Comments } from './Comments';
import { createThreadPlugin, ELEMENT_THREAD } from './createThreadPlugin';

const initialValue = [
  {
    type: 'p',
    children: [{ text: 'A line of text in a paragraph.' }],
  },
];

const components = createPlateUI({
  [ELEMENT_THREAD]: ThreadElement,
});

const plugins = createPlugins([...[createThreadPlugin()]], {
  components,
});

const App = () => {
  const [commentActions, setCommentActions] = useState<any>();

  return (
    <div>
      {commentActions ? (
        <AddThreadToolbarButton
          icon={<AddComment />}
          onAddThread={commentActions.onAddThread}
        />
      ) : null}
      <Plate
        id="main"
        editableProps={{
          placeholder: 'Enter some plain text...',
        }}
        initialValue={initialValue}
        plugins={plugins}
        onChange={console.log}
      >
        <Comments setCommentActions={setCommentActions} />
      </Plate>
    </div>
  );
};

render(<App />, document.getElementById('root'));
