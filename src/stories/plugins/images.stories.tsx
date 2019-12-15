import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  ImagePlugin,
  InsertImageButton,
  renderElementImage,
  useCreateEditor,
} from 'slate-plugins';
import { StyledToolbar } from 'slate-plugins/common/components/Toolbar';
import { Slate, withReact } from 'slate-react';
import { initialValueImages } from '../config/initialValues';

export default {
  title: 'Plugins|ImagePlugin',
};

export const Images = () => {
  const plugins = [];
  const renderElement = [];
  if (boolean('ImagePlugin', true, 'plugins')) plugins.push(ImagePlugin());
  else if (boolean('renderElementImage', false, 'renderElement'))
    renderElement.push(renderElementImage);

  const [value, setValue] = useState(initialValueImages);

  const editor = useCreateEditor([withReact, withHistory], plugins);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={newValue => setValue(newValue)}
    >
      <StyledToolbar height={18}>
        <InsertImageButton />
      </StyledToolbar>
      <EditablePlugins
        plugins={plugins}
        renderElement={renderElement}
        placeholder="Enter some text..."
      />
    </Slate>
  );
};
