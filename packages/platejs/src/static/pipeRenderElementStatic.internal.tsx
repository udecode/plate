import React from 'react';

import { failInvariant } from '../internal/failInvariant';
import {
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getCompiledPlatePluginByType,
  getPlateRuntime,
} from '../internal/plugin/compilePlateModel';
import type { AnyPluginBase, Editor } from '../lib';
import { EditorElement } from './components/plite-nodes';
import { hasStaticPresentation } from './internal/staticPresentation';
import {
  type PliteRenderElement,
  pluginRenderElementStatic,
  renderStaticAfterNodeChildren,
} from './pluginRenderElementStatic.internal';
import { getRenderNodeStaticProps } from './utils/getRenderNodeStaticProps.internal';

export const pipeRenderElementStatic = (
  editor: Editor,
  {
    renderElement: renderElementProp,
  }: {
    renderElement?: PliteRenderElement;
  } = {}
): PliteRenderElement =>
  function render(props) {
    const plugin = getCompiledPlatePluginByType(
      editor,
      props.element.type
    ) as unknown as AnyPluginBase | undefined;
    const binding = plugin
      ? getCompiledPlateModelBinding(editor, plugin)
      : undefined;

    if (plugin && binding?.kind === 'element') {
      return pluginRenderElementStatic(editor, plugin)(props);
    }

    if (renderElementProp) {
      return renderElementProp(props);
    }

    const ctxProps = getRenderNodeStaticProps({
      editor,
      path: props.path,
      props: { ...props } as any,
    });

    return (
      <EditorElement {...ctxProps}>
        {props.children}

        {hasStaticPresentation(editor)
          ? renderStaticAfterNodeChildren(editor, ctxProps)
          : getPlateRuntime(editor).pluginCache.slots.afterNodeChildren.map(
              (name) => {
                const innerPlugin = (getCompiledPlatePlugin(editor, name) ??
                  failInvariant('Expected value to be defined')) as any;
                const Component = innerPlugin.slots.afterNodeChildren;

                return <Component key={name} {...ctxProps} />;
              }
            )}
      </EditorElement>
    );
  };
