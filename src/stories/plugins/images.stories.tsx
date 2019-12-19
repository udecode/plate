import React, { useState } from 'react';
import { boolean } from '@storybook/addon-knobs';
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
};

export const Images = () => {
  const plugins: any[] = [];
  const renderElement: any = [];
  if (boolean('ImagePlugin', true)) plugins.push(ImagePlugin());
  if (boolean('renderElementImage', false))
    renderElement.push(renderElementImage());

  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueImages);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const editor = useCreateEditor(
      [withImage, withReact, withHistory],
      plugins
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
        <EditablePlugins
          plugins={plugins}
          renderElement={renderElement}
          placeholder="Enter some text..."
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
