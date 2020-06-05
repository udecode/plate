import React, { useMemo, useState } from 'react';
import { createEditor } from 'slate';
import { withHistory } from 'slate-history';
import { Slate, withReact } from 'slate-react';
import {
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
  pipe,
  SlateDocument,
  withNormalizeTypes,
  withTrailingNode,
  withTransforms,
} from '../../packages/slate-plugins/src';
import { initialValueForcedLayout, nodeTypes } from '../config/initialValues';

export default {
  title: 'Normalizers/Forced Layout',
  component: withNormalizeTypes,
  subcomponents: { withTrailingNode },
};

const plugins = [ParagraphPlugin(nodeTypes), HeadingPlugin(nodeTypes)];

const withPlugins = [
  withReact,
  withHistory,
  withTransforms(),
  withNormalizeTypes({
    rules: [{ path: [0, 0], strictType: nodeTypes.typeH1 }],
  }),
  withTrailingNode({ type: nodeTypes.typeH3, level: 1 }),
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
