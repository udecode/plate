import React from 'react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { PlateEditor } from '../types/PlateEditor';
import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';
import { PlatePlugin } from '../types/plugins/PlatePlugin/PlatePlugin';
import { RenderLeaf } from '../types/plugins/PlatePlugin/RenderLeaf';
import { getRenderLeaf } from './getRenderLeaf';
import { injectOverrideProps } from './injectOverrideProps';

/**
 * @see {@link RenderLeaf}
 */
export const pipeRenderLeaf = (
  editor: PlateEditor,
  {
    plugins = [],
    editableProps,
  }: { plugins: PlatePlugin[]; editableProps?: EditableProps }
): EditableProps['renderLeaf'] => {
  const renderLeafs: RenderLeaf[] = [];

  plugins.forEach((plugin) => {
    if (plugin.isLeaf && plugin.key) {
      renderLeafs.push(getRenderLeaf(editor, plugin));
    }
  });

  return (_props) => {
    const props = injectOverrideProps<PlateRenderLeafProps>(editor, {
      props: _props,
      plugins,
    });

    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(props as any);
      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    if (editableProps?.renderLeaf) {
      return editableProps.renderLeaf(props);
    }

    return <DefaultLeaf {...props} />;
  };
};
