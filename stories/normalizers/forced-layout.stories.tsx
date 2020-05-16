import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
  withForcedLayout,
  withTransforms,
} from '../../packages/slate-plugins/src';
import { initialValueForcedLayout, nodeTypes } from '../config/initialValues';

export default {
  title: 'Normalizers/Forced Layout',
};

const plugins = [ParagraphPlugin(nodeTypes), HeadingPlugin(nodeTypes)];

export const Example = () => {
  const createReactEditor = () => () => {
    const [value, setValue] = useState(initialValueForcedLayout);

    const editor = useMemo(
      () =>
        withForcedLayout(nodeTypes)(
          withTransforms()(withHistory(withReact(createEditor())))
        ),
      []
    );

    return (
      <Slate
        editor={editor}
        value={value}
        onChange={(newValue) => setValue(newValue)}
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
