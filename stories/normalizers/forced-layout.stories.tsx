import React from 'react';
import {
  EditablePlugins,
  HeadingPlugin,
  ParagraphPlugin,
  SlatePlugins,
  withNormalizeTypes,
  withTrailingNode,
} from '@udecode/slate-plugins';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { initialValueForcedLayout, options } from '../config/initialValues';

const id = 'Normalizers/Forced Layout';

export default {
  title: id,
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
    return (
      <SlatePlugins
        id={id}
        initialValue={initialValueForcedLayout}
        withPlugins={withPlugins}
      >
        <EditablePlugins
          id={id}
          plugins={plugins}
          placeholder="Enter a title…"
          spellCheck
          autoFocus
        />
      </SlatePlugins>
    );
  };

  const Editor = createReactEditor();

  return <Editor />;
};
