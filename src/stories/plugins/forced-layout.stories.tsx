import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  HeadingPlugin,
  withForcedLayout,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueForcedLayout } from '../config/initialValues';

export default {
  title: 'Plugins/withForcedLayout',
  component: withForcedLayout,
};

const plugins = [HeadingPlugin()];

export const ForcedLayout = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueForcedLayout);

    const editor = useMemo(() => withHistory(withReact(createEditor())), []);
    const editor = useCreateEditor(
      [withForcedLayout, withReact, withHistory],
      plugins
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={newValue => setValue(newValue)}
      >
        <EditablePlugins
          plugins={plugins}
          placeholder="Enter a title…"
          spellCheck
          autoFocus
        />
      </Slate>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
