import React, { useCallback, useMemo, useState } from 'react';
import {
  getHistoryPlugin,
  getReactPlugin,
  getSlatePluginsComponents,
  getSlatePluginsOptions,
  SlatePlugins,
} from '@udecode/slate-plugins';
import { getHeadingPlugin } from '@udecode/slate-plugins-heading';
import { getParagraphPlugin } from '@udecode/slate-plugins-paragraph';
import { createEditor, Descendant } from 'slate';
import { Editable, RenderElementProps, Slate, withReact } from 'slate-react';
import { initialValueHugeDocument } from '../config/initialValues';
import { editableProps } from '../config/pluginOptions';

const id = 'Examples/Huge Document';

export default {
  title: id,
};

const components = getSlatePluginsComponents();
const options = getSlatePluginsOptions();

const plugins = [
  getReactPlugin(),
  getHistoryPlugin(),
  getHeadingPlugin(),
  getParagraphPlugin(),
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
  switch ((element as any).type) {
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
