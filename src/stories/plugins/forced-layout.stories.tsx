import React, { useState } from 'react';
import { withHistory } from 'slate-history';
import {
  EditablePlugins,
  ForcedLayoutPlugin,
  FormatPlugin,
  useCreateEditor,
} from 'slate-plugins';
import { Slate, withReact } from 'slate-react';
import { initialValueForcedLayout } from '../config/initialValues';

export default {
  title: 'Plugins|ForcedLayoutPlugin',
  component: ForcedLayoutPlugin,
};

const plugins = [ForcedLayoutPlugin(), FormatPlugin()];

export const ForcedLayout = () => {
  const [value, setValue] = useState(initialValueForcedLayout);

  const editor = useCreateEditor([withReact, withHistory], plugins);

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
