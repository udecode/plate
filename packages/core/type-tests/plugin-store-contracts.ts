import { defineBasePlugin } from '@platejs/core';
import {
  createPlateEditor,
  toPlatePlugin,
  useEditorPluginStore,
  usePluginStore,
} from '@platejs/core/react';

type SuggestionPluginState = {
  activeId: string | null;
  enabled: boolean;
  hoverId: string | null;
};

const suggestionInitialState: SuggestionPluginState = {
  activeId: null,
  enabled: true,
  hoverId: null,
};

const BaseStoreContractPlugin = defineBasePlugin('storeContract', {
  initialState: suggestionInitialState,
  selectors: {
    isActive: (state, id: string) => state.activeId === id,
  },
});

const StoreContractPlugin = toPlatePlugin(BaseStoreContractPlugin).configure(
  {}
);

const editor = createPlateEditor({ plugins: [StoreContractPlugin] });

const usePluginStoreContracts = () => {
  const activeId = usePluginStore(StoreContractPlugin, 'activeId');
  const active = usePluginStore(
    StoreContractPlugin,
    'isActive',
    'suggestion-1'
  );
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
  // @ts-expect-error A name-only object carries no plugin store contract.
  usePluginStore({ name: 'storeContract' }, 'activeId');
  // @ts-expect-error Explicit-editor hooks also require a typed descriptor.
  useEditorPluginStore(editor, { name: 'storeContract' }, 'activeId');

  void exactActive;
  void exactActiveId;
  void exactExternalActive;
  void exactExternalActiveId;
  void exactPortalActive;
  void exactSelected;
  void invalidActiveId;
};

void usePluginStoreContracts;
