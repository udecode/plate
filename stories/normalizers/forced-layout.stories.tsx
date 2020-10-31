import React, { useMemo, useState } from 'react';
import {
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  withNormalizeTypes,
  withTrailingNode,
} from '@udecode/slate-plugins';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import { initialValueForcedLayout, options } from '../config/initialValues';

export default {
  title: 'Normalizers/Forced Layout',
  component: withNormalizeTypes,
  subcomponents: { withTrailingNode },
};

const plugins = [ParagraphPlugin(options), HeadingPlugin(options)];

const withPlugins = [
  withReact,
  withHistory,
  withNormalizeTypes({
    rules: [{ path: [0, 0], strictType: options.h1.type }],
  }),
  withTrailingNode({ type: options.h3.type, level: 1 }),
] as const;

export const Example = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueForcedLayout);

    const editor = useMemo(() => pipe(createEditor(), ...withPlugins), []);

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue as SlateDocument)}
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
