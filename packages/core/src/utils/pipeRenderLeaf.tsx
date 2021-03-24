import * as React from 'react';
import { DefaultLeaf, RenderLeafProps } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { SPEditor } from '../types/SPEditor';
import { flatMapByKey } from './flatMapByKey';

/**
 * @see {@link RenderLeaf}
 */
export const pipeRenderLeaf = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['renderLeaf'] => (props) => {
  const leafProps: RenderLeafProps = { ...props }; // workaround for children readonly error.

  flatMapByKey(plugins, 'renderLeaf').forEach((renderLeaf) => {
    if (!renderLeaf) return;

    const newChildren = renderLeaf(editor)(leafProps);
    if (newChildren !== undefined) {
      leafProps.children = newChildren;
    }
  });

  return <DefaultLeaf {...leafProps} />;
};
