/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';

import type { PlateEditor } from '../editor/PlateEditor';

import { type EditableProps, getPluginByType } from '../../lib';
import { PlateElement } from '../components';
import { useNodePath } from '../hooks';
import { useReadOnly } from '../slate-react';
import { ElementProvider } from '../stores';
import { getRenderNodeProps } from './getRenderNodeProps';
import { BelowRootNodes, pluginRenderElement } from './pluginRenderElement';

/** @see {@link RenderElement} */
export const pipeRenderElement = (
  editor: PlateEditor,
  renderElementProp?: EditableProps['renderElement']
): EditableProps['renderElement'] => {
  return function render(props) {
    const readOnly = useReadOnly();

    const path = useNodePath(props.element)!;

    const plugin = getPluginByType(editor, props.element.type);

    // We could deprecate isElement (unneeded check)
    if (plugin?.node.isElement) {
      return pluginRenderElement(
        editor,
        plugin as any
      )({
        ...props,
        path,
      } as any) as any;
    }

    if (renderElementProp) {
      return renderElementProp({ ...props, path } as any);
    }

    const ctxProps = getRenderNodeProps({
      // `transformProps` can run hooks, so we need to disable it for default elements.
      disableInjectNodeProps: true,
      editor,
      props: { ...props, path } as any,
      readOnly,
    }) as any;

    return (
      <ElementProvider
        element={ctxProps.element}
        entry={[ctxProps.element, path]}
        path={path}
        scope={ctxProps.element.type ?? 'default'}
      >
        <PlateElement {...ctxProps}>
          {props.children}

          <BelowRootNodes {...ctxProps} />
        </PlateElement>
      </ElementProvider>
    );
  };
};
