/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';

import type { EditableProps } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';

import { PlateElement } from '../components';
import { useNodePath } from '../hooks';
import { getPlugin } from '../plugin';
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
    let element;

    const readOnly = useReadOnly();

    const path = useNodePath(props.element)!;

    editor.meta.pluginCache.node.isElement.some((key) => {
      element = pluginRenderElement(
        editor,
        getPlugin(editor, { key })
      )({
        ...props,
        path,
      } as any);

      return !!element;
    });

    if (element) return element;
    if (renderElementProp) {
      return renderElementProp({ ...props, path } as any);
    }

    const ctxProps = getRenderNodeProps({
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
