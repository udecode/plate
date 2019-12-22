import React, { useMemo, useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  ImagePlugin,
  InsertImageButton,
  renderElementImage,
  withImage,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueImages } from '../config/initialValues';

export default {
  title: 'Plugins/ImagePlugin',
  component: ImagePlugin,
  subcomponents: {
    renderElementImage,
    InsertImageButton,
  },
};

export const Images = () => {
  const plugins: any[] = [];
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueImages);

    const editor = useMemo(
      () => withImage(withHistory(withReact(createEditor()))),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <StyledToolbar height={18}>
          <InsertImageButton />
        </StyledToolbar>
        <EditablePlugins plugins={plugins} placeholder="Enter some text..." />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
