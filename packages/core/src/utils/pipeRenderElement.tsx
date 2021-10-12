import * as React from 'react';
import { DefaultElement } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { PlatePlugin } from '../types/PlatePlugin/PlatePlugin';
import { SPEditor } from '../types/SPEditor';

/**
 * @see {@link RenderElement}
 */
export const pipeRenderElement = (
  editor: SPEditor,
  plugins: PlatePlugin[] = []
): EditableProps['renderElement'] => {
  const renderElements = plugins.flatMap(
    (plugin) => plugin.renderElement?.(editor) ?? []
  );

  const propsOverriders = plugins.flatMap(
    (plugin) => plugin.overrideProps ?? []
  );

  return (renderElementProps) => {
    let element;

    let props = renderElementProps as any;

    propsOverriders.forEach((overrideProps) => {
      const newProps = overrideProps(props);

      if (newProps) {
        props = {
          ...props,
          ...newProps,
        };
      }
    });

    renderElements.some((renderElement) => {
      element = renderElement(props);
      return !!element;
    });
    if (element) return element;

    return <DefaultElement {...props} />;
  };
};
