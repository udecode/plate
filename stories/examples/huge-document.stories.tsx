import React, { useCallback, useMemo, useState } from 'react';
import {
  createHistoryPlugin,
  createReactPlugin,
  createSlatePluginsComponents,
  createSlatePluginsOptions,
  SlatePlugins,
  TElement,
} from '@udecode/slate-plugins';
import { createHeadingPlugin } from '@udecode/slate-plugins-heading';
import { createParagraphPlugin } from '@udecode/slate-plugins-paragraph';
import { createEditor, Descendant } from 'slate';
import { Editable, RenderElementProps, Slate, withReact } from 'slate-react';
import { initialValueHugeDocument } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Examples/Huge Document';

export default {
  title: id,
};

const components = createSlatePluginsComponents();
const options = createSlatePluginsOptions();
const plugins = [
  createReactPlugin(),
  createHistoryPlugin(),
  createHeadingPlugin(),
  createParagraphPlugin(),
];

export const WithSlatePlugins = () => (
  <SlatePlugins
    id={id}
    plugins={plugins}
    components={components}
    options={options}
    editableProps={editableProps}
    initialValue={initialValueHugeDocument}
  />
);

const Element = ({ attributes, children, element }: RenderElementProps) => {
  switch ((element as TElement).type) {
    case 'h1':
      return <h1 {...attributes}>{children}</h1>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

export const WithoutSlatePlugins = () => {
  const [value, setValue] = useState<Descendant[]>(initialValueHugeDocument);
  const renderElement = useCallback((p: any) => <Element {...p} />, []);
  const editor = useMemo(() => withReact(createEditor()), []);

  return (
    <Slate
      editor={editor}
      value={value}
      onChange={useCallback((v) => setValue(v), [])}
    >
      <Editable renderElement={renderElement} {...editableProps} />
    </Slate>
  );
};
