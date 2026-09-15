import React from 'react';

import {
  getCompiledPlatePlugin,
  getPlateRuntime,
} from '../../internal/plugin/compilePlateModel';
import { useEditorContext } from '../internal/plite-components';
import { usePublishPlateRenderedAttributes } from '../internal/rendered-attributes';
import { createPluginContext } from '../plugin/createPluginContext.internal';
import type { AnyResolvedPlugin } from '../plugin/PlatePlugin';
import { useEditor } from '../stores';

const viewElementAttributeHookIds = new WeakMap<object, number>();
let nextViewElementAttributeHookId = 0;

const getViewElementAttributeHookKey = (callback: object) => {
  const current = viewElementAttributeHookIds.get(callback);

  if (current !== undefined) return current;

  const next = nextViewElementAttributeHookId;

  nextViewElementAttributeHookId += 1;

  viewElementAttributeHookIds.set(callback, next);

  return next;
};

function ViewElementAttributesHookProgram({
  plugin,
  sourceOrder,
  useViewElementAttributes,
}: {
  plugin: AnyResolvedPlugin;
  sourceOrder: number;
  useViewElementAttributes: NonNullable<
    AnyResolvedPlugin['render']['useViewElementAttributes']
  >;
}) {
  const editor = useEditor();
  const view = useEditorContext();
  const entries = useViewElementAttributes({
    ...createPluginContext(editor, plugin),
    view,
  });

  usePublishPlateRenderedAttributes(plugin.name, sourceOrder, entries);

  return null;
}

export function ViewElementAttributesEffect({
  plugin,
  sourceOrder,
}: {
  plugin: AnyResolvedPlugin;
  sourceOrder: number;
}) {
  const { useViewElementAttributes } = plugin.render;

  if (!useViewElementAttributes) return null;

  return (
    <ViewElementAttributesHookProgram
      key={getViewElementAttributeHookKey(useViewElementAttributes)}
      plugin={plugin}
      sourceOrder={sourceOrder}
      useViewElementAttributes={useViewElementAttributes}
    />
  );
}

export function EditorRefEffect() {
  const editor = useEditor();

  return (
    <>
      {getPlateRuntime(editor).pluginCache.useViewElementAttributes.map(
        (name, sourceOrder) => (
          <ViewElementAttributesEffect
            key={name}
            plugin={
              getCompiledPlatePlugin(
                editor,
                name
              ) as unknown as AnyResolvedPlugin
            }
            sourceOrder={sourceOrder}
          />
        )
      )}
    </>
  );
}
