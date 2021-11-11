import React from 'react';
import castArray from 'lodash/castArray';
import { EditableProps } from 'slate-react/dist/components/editable';
import { DefaultLeaf } from '../components/DefaultLeaf';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { RenderLeaf } from '../types/PlatePlugin/RenderLeaf';
import { PlateRenderLeafProps } from '../types/PlateRenderLeafProps';
import { TRenderLeafProps } from '../types/TRenderLeafProps';
import { getRenderLeaf } from './getRenderLeaf';
import { pipeOverrideProps } from './pipeOverrideProps';

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
      renderLeafs.push(getRenderLeaf(editor, plugin.key));
    }
  });

  const propsOverriders = plugins.flatMap((plugin) =>
    castArray(plugin.overrideProps).flatMap((cb) => cb?.(editor) ?? [])
  );

  return (renderLeafProps) => {
    const props: PlateRenderLeafProps = {
      ...pipeOverrideProps(
        renderLeafProps as TRenderLeafProps,
        propsOverriders
      ),
      editor,
      plugins,
    };

    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(props);
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
