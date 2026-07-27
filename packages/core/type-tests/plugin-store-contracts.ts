import { createBasePlugin } from '@platejs/core';
import {
  createPlateEditor,
  toPlatePlugin,
  useEditorPluginStore,
  usePluginStore,
} from '@platejs/core/react';

type SuggestionState = {
  activeId: string | null;
  hoverId: string | null;
};

const suggestionState: SuggestionState = {
  activeId: null,
  hoverId: null,
};

const BaseStoreContractPlugin = createBasePlugin({
  initialState: { enabled: true },
  key: 'storeContract',
});

const StoreContractPlugin = toPlatePlugin(BaseStoreContractPlugin)
  .extend({
    initialState: suggestionState,
  })
  .extend(() => ({
    selectors: {
      isActive: (state, id: string) => state.activeId === id,
    },
  }))
  .configure({});

const editor = createPlateEditor({ plugins: [StoreContractPlugin] });

const activeId = usePluginStore(StoreContractPlugin, 'activeId');
const active = usePluginStore(StoreContractPlugin, 'isActive', 'suggestion-1');
const selected = usePluginStore(
  StoreContractPlugin,
  (state) => {
    const enabled: boolean = state.enabled;
    const hoverId: string | null = state.hoverId;

    // @ts-expect-error Plugin snapshots are readonly.
    state.activeId = null;
    // @ts-expect-error Unknown fields do not leak into selector callbacks.
    void state.missing;

    return [enabled, hoverId] as const;
  },
  {
    equalityFn: (previous, next) =>
      previous[0] === next[0] && previous[1] === next[1],
  }
);
const externalActiveId = useEditorPluginStore(
  editor,
  StoreContractPlugin,
  'activeId'
);
const externalActive = useEditorPluginStore(
  editor,
  StoreContractPlugin,
  'isActive',
  'suggestion-1'
);
const portalActive = editor
  .plugin(StoreContractPlugin)
  .store.get('isActive', 'suggestion-1');

const exactActiveId: string | null = activeId;
const exactActive: boolean = active;
const exactExternalActiveId: string | null = externalActiveId;
const exactExternalActive: boolean = externalActive;
const exactPortalActive: boolean = portalActive;
const exactSelected: readonly [boolean, string | null] = selected;

// @ts-expect-error Field results must not degrade to any.
const invalidActiveId: number = activeId;
// @ts-expect-error Unknown state and selector keys are rejected.
usePluginStore(StoreContractPlugin, 'missing');
// @ts-expect-error Named selector arguments are required.
usePluginStore(StoreContractPlugin, 'isActive');
// @ts-expect-error Named selector arguments keep their declared types.
usePluginStore(StoreContractPlugin, 'isActive', 1);
// @ts-expect-error Named selectors reject extra arguments.
usePluginStore(StoreContractPlugin, 'isActive', 'suggestion-1', true);
// @ts-expect-error Raw state fields do not accept selector arguments.
usePluginStore(StoreContractPlugin, 'activeId', 'suggestion-1');
// @ts-expect-error A key-only object carries no plugin store contract.
usePluginStore({ key: 'storeContract' }, 'activeId');
// @ts-expect-error Explicit-editor hooks also require a typed descriptor.
useEditorPluginStore(editor, { key: 'storeContract' }, 'activeId');

void exactActive;
void exactActiveId;
void exactExternalActive;
void exactExternalActiveId;
void exactPortalActive;
void exactSelected;
void invalidActiveId;
