import * as React from 'react';
import { DefaultLeaf } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * @see {@link RenderLeaf}
 */
export const pipeRenderLeaf = (
  editor: SPEditor,
  plugins: PlatePlugin[] = []
): EditableProps['renderLeaf'] => {
  const renderLeafs = plugins.flatMap(
    (plugin) => plugin.renderLeaf?.(editor) ?? []
  );

  const propsOverriders = plugins.flatMap(
    (plugin) => plugin.overrideProps?.(editor) ?? []
  );

  return (renderLeafProps) => {
    let props = renderLeafProps as any;

    propsOverriders.forEach((overrideProps) => {
      const newProps = overrideProps(props);

      if (newProps) {
        props = {
          ...props,
          ...newProps,
        };
      }
    });

    renderLeafs.forEach((renderLeaf) => {
      const newChildren = renderLeaf(props);
      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    return <DefaultLeaf {...props} />;
  };
};
