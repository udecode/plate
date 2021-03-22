import * as React from 'react';
import { Editor } from 'slate';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { flatMapKey } from './flatMapKey';

/**
 * @see {@link RenderLeaf}
 */
export const renderLeafPlugins = (
  editor: Editor,
  plugins: SlatePlugin[]
): EditableProps['renderLeaf'] => (props) => {
  const leafProps: RenderLeafProps = { ...props }; // workaround for children readonly error.

  flatMapKey(plugins, 'renderLeaf').forEach((renderLeaf) => {
    if (!renderLeaf) return;

    const newChildren = renderLeaf(editor)(leafProps);
    if (newChildren !== undefined) {
      leafProps.children = newChildren;
    }
  });

  return <DefaultLeaf {...leafProps} />;
};
