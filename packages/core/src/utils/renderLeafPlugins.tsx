import * as React from 'react';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { flatMapKey } from './flatMapKey';

/**
 * @see {@link RenderLeaf}
 */
export const renderLeafPlugins = (
  editor: SPEditor,
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
