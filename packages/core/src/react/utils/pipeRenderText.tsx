import React from 'react';

import clsx from 'clsx';

import type { EditableProps } from '../../lib';
import type { PlateEditor } from '../editor/PlateEditor';
import type { AnyEditorPlatePlugin } from '../plugin';

import { PlateText } from '../components/plate-nodes';
import { useReadOnly } from '../slate-react';
import { getRenderNodeProps } from './getRenderNodeProps';
import { type RenderText, pluginRenderText } from './pluginRenderText';

/** @see {@link RenderText} */
export const pipeRenderText = (
  editor: PlateEditor,
  renderTextProp?: EditableProps['renderText']
): EditableProps['renderText'] => {
  const renderTexts: RenderText[] = [];
  const textPropsPlugins: AnyEditorPlatePlugin[] = [];

  editor.meta.pluginList.forEach((plugin) => {
    if (plugin.node.isLeaf && plugin.node.isDecoration === false) {
      renderTexts.push(pluginRenderText(editor, plugin));
    }

    if (plugin.node.textProps) {
      textPropsPlugins.push(plugin);
    }
  });

  return function render({ attributes, ...props }) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const readOnly = useReadOnly();

    renderTexts.forEach((renderText) => {
      const newChildren = renderText(props as any);

      if (newChildren !== undefined) {
        props.children = newChildren;
      }
    });

    textPropsPlugins.forEach((plugin) => {
      if (props.text[plugin.node.type ?? plugin.key]) {
        const pluginTextProps =
          typeof plugin.node.textProps === 'function'
            ? plugin.node.textProps(props as any)
            : (plugin.node.textProps ?? {});

        if (pluginTextProps.className) {
          pluginTextProps.className = clsx(
            (props as any).className,
            pluginTextProps.className
          );
        }

        attributes = {
          ...attributes,
          ...pluginTextProps,
        };
      }
    });

    if (renderTextProp) {
      return renderTextProp({ attributes, ...props } as any);
    }

    const ctxProps = getRenderNodeProps({
      editor,
      props: { attributes, ...props } as any,
      readOnly,
    }) as any;

    return <PlateText {...ctxProps}>{props.children}</PlateText>;
  };
};
