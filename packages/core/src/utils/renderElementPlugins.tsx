import * as React from 'react';
import { DefaultElement } from 'slate-react';
import { EditableProps } from 'slate-react/dist/components/editable';
import { SPEditor } from '../plugins/useSlatePluginsPlugin';
import { SlatePlugin } from '../types/SlatePlugin/SlatePlugin';
import { TRenderElementProps } from '../types/TRenderElementProps';
import { flatMapKey } from './flatMapKey';

/**
 * @see {@link RenderElement}
 */
export const renderElementPlugins = (
  editor: SPEditor,
  plugins: SlatePlugin[]
): EditableProps['renderElement'] => (elementProps) => {
  let element;

  flatMapKey(plugins, 'renderElement').some((renderElement) => {
    element = renderElement(editor)(elementProps as TRenderElementProps);
    return !!element;
  });
  if (element) return element;

  return <DefaultElement {...elementProps} />;
};
