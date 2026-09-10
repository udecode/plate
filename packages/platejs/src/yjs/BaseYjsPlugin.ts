import { defineBasePlugin, type DefinitionOf } from '../core';
import { yjs, type YjsExtensionOptions } from './core';

export type YjsPluginState = {
  [K in keyof YjsExtensionOptions]-?: Exclude<
    YjsExtensionOptions[K],
    undefined
  > | null;
};

const initialState: YjsPluginState = {
  autoSendSelection: null,
  awareness: null,
  awarenessDataField: null,
  awarenessSelectionField: null,
  clientId: null,
  cursorData: null,
  destroyProviderOnUnmount: null,
  doc: null,
  provider: null,
  rootName: null,
  seedProviderOnSync: null,
  sharedEffectCompaction: null,
};

/**
 * Resolves the imported Plite extension per editor so configured Yjs state can
 * be captured before its native fields are merged onto the plugin root.
 */
export const BaseYjsPlugin = defineBasePlugin('yjs', {
  initialState,
}).extend(({ store }) => {
  const state = store.get();

  return yjs({
    autoSendSelection: state.autoSendSelection ?? undefined,
    awareness: state.awareness ?? undefined,
    awarenessDataField: state.awarenessDataField ?? undefined,
    awarenessSelectionField: state.awarenessSelectionField ?? undefined,
    clientId: state.clientId ?? undefined,
    cursorData: state.cursorData ?? undefined,
    destroyProviderOnUnmount: state.destroyProviderOnUnmount ?? undefined,
    doc: state.doc ?? undefined,
    provider: state.provider ?? undefined,
    rootName: state.rootName ?? undefined,
    seedProviderOnSync: state.seedProviderOnSync ?? undefined,
    sharedEffectCompaction: state.sharedEffectCompaction ?? undefined,
  });
});

export type YjsDefinition = DefinitionOf<typeof BaseYjsPlugin>;
