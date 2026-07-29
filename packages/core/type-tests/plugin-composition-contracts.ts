import type {
  AnyPluginConfig,
  BasePlugin,
  InferDependencies,
  InferPluginStoreState,
  PluginConfig,
  PluginReference,
} from '@platejs/core';
import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { defineStateField, editorCommands } from '@platejs/plite';
import {
  createPlateEditor,
  createPlatePlugin,
  toPlatePlugin,
} from '@platejs/core/react';

type PluginConfigOf<P> = P extends {
  readonly __config: infer C extends AnyPluginConfig;
}
  ? C
  : never;

export const DeclarationSafeBaseExtensionPlugin = createBasePlugin({
  key: 'declarationSafeBaseExtension',
  initialState: { enabled: true },
})
  .extend(({ store }) => ({
    extension: {
      corrections: [
        {
          correct() {
            void store.get().enabled;
          },
          event: 'content',
        },
      ],
    },
  }))
  .configure(({ store }) => ({
    initialState: { enabled: store.get().enabled },
  }));

export const DeclarationSafeReactExtensionPlugin = createPlatePlugin({
  key: 'declarationSafeReactExtension',
  initialState: { enabled: true },
}).extend(({ store }) => ({
  extension: {
    corrections: [
      {
        correct() {
          void store.get().enabled;
        },
        event: 'content',
      },
    ],
  },
}));

const RequiredLeafPlugin = createBasePlugin({
  key: 'requiredLeaf',
  api: {
    read: () => 'required' as const,
  },
}).extend(() => ({
  update: () => ({
    runRequiredLeaf: () => undefined,
  }),
}));

const RequiredBranchPlugin = createBasePlugin({
  dependencies: [RequiredLeafPlugin],
  key: 'requiredBranch',
  api: {
    read: () => 'branch' as const,
  },
});

export const DependencyAwareBaseExtensionPlugin = createBasePlugin({
  dependencies: [RequiredLeafPlugin],
  key: 'dependencyAwareBaseExtension',
}).extend(() => ({
  extension: {
    commands: ({ handle }) => [
      handle(editorCommands.insertText, ({ input, state }) => {
        const exactText: string = input.text;

        void exactText;

        return state.transaction((tx) => {
          tx.requiredLeaf.runRequiredLeaf();
          // @ts-expect-error Extension transactions expose installed dependency groups only.
          tx.missingDependency.run();
        });
      }),
    ],
  },
}));

const portableStateField = defineStateField({
  initial: false,
  key: 'portable-extension-contract',
});

type PortableExplicitContract = {
  api: {
    pluginMethod: (value: 'plugin') => 'plugin';
  };
  update: {
    mutate: (value: 'update') => void;
  };
};

const PortableExplicitPlugin = createBasePlugin<
  PluginConfig<
    'portableExplicit',
    {},
    {},
    { portableExplicit: PortableExplicitContract['update'] },
    {},
    {},
    readonly [],
    never,
    PortableExplicitContract['api']
  >
>({
  api: {
    pluginMethod: (value) => value,
  },
  key: 'portableExplicit',
  update: () => ({
    mutate: (value) => {
      const exactValue: 'update' = value;

      void exactValue;
    },
  }),
}).extend({ extension: [portableStateField] });
const portableExplicitEditor = createBaseEditor({
  plugins: [PortableExplicitPlugin],
});
const portablePluginValue: 'plugin' = portableExplicitEditor
  .plugin(PortableExplicitPlugin)
  .api.pluginMethod('plugin');

portableExplicitEditor.update.portableExplicit.mutate('update');
// @ts-expect-error Built extensions do not claim undeclared root API members.
void portableExplicitEditor.api.portableExplicit.undeclaredRoot;
// @ts-expect-error Built extensions do not claim undeclared root state groups.
void portableExplicitEditor.state.portableExplicit;
void portablePluginValue;

const ExplicitInlineExtensionPlugin = createBasePlugin({
  key: 'explicitInlineExtension',
  api: { ready: () => true },
  extension: {
    commands: ({ handle }) => [
      handle(editorCommands.insertText, ({ input, state }) => {
        const exactText: string = input.text;

        void exactText;

        return state.transaction(() => undefined);
      }),
    ],
    name: 'explicit-inline-extension',
  },
});

void ExplicitInlineExtensionPlugin;

const DeclaredRootExtensionPlugin = createBasePlugin({
  key: 'declaredRootExtension',
  extension: {
    api: () => ({
      declaredRoot: {
        value: () => 'declared' as const,
      },
    }),
    name: 'declared-root-extension',
  },
});
const declaredRootEditor = createBaseEditor({
  plugins: [DeclaredRootExtensionPlugin],
});
const declaredRootValue: 'declared' =
  declaredRootEditor.api.declaredRoot.value();

void declaredRootValue;

export const ParentPlugin = createBasePlugin({
  dependencies: [RequiredBranchPlugin],
  key: 'parent',
}).extend(({ editor }) => ({
  update: ({ tx }) => ({
    runParent: () => {
      const branch: 'branch' = editor.api.requiredBranch.read();
      const required: 'required' = editor.api.requiredLeaf.read();

      tx.requiredLeaf.runRequiredLeaf();
      void branch;
      void required;
    },
  }),
}));

type ParentConfig = PluginConfigOf<typeof ParentPlugin>;
type ParentDependencyConfig = PluginConfigOf<
  InferDependencies<ParentConfig>[0]
>;
const exactParentDependencies: readonly [typeof RequiredBranchPlugin] =
  ParentPlugin.dependencies;
const parentDependenciesRoundTrip: InferDependencies<ParentConfig> =
  exactParentDependencies;
const dependencyOptionsStayOnDescriptor: keyof InferPluginStoreState<ParentDependencyConfig> extends never
  ? true
  : false = true;

void dependencyOptionsStayOnDescriptor;
void parentDependenciesRoundTrip;

const baseEditor = createBaseEditor({ plugins: [ParentPlugin] });

const branchValue: 'branch' = baseEditor.api.requiredBranch.read();
const requiredValue: 'required' = baseEditor.api.requiredLeaf.read();

baseEditor.update((tx) => {
  tx.parent.runParent();
  tx.requiredLeaf.runRequiredLeaf();
});

void branchValue;
void requiredValue;

type DeclarationFallbackDependency = PluginReference & {
  readonly __config: AnyPluginConfig;
};
type DeclarationFallbackOwnerConfig = PluginConfig<
  'declarationFallbackOwner',
  {},
  {},
  {
    declarationFallbackOwner: {
      run: () => void;
    };
  },
  {},
  {},
  readonly DeclarationFallbackDependency[]
>;
declare const declarationFallbackOwner: BasePlugin<DeclarationFallbackOwnerConfig>;
const declarationFallbackEditor = createBaseEditor({
  plugins: [declarationFallbackOwner],
});

declarationFallbackEditor.update((tx) => {
  tx.declarationFallbackOwner.run();
  // @ts-expect-error An unresolved dependency cannot publish arbitrary updates.
  tx.unresolvedDependency.run();
});

const TransitiveParentPlugin = createBasePlugin({
  dependencies: [ParentPlugin],
  key: 'transitiveParent',
});
const transitiveEditor = createBaseEditor({
  plugins: [TransitiveParentPlugin],
});

transitiveEditor.api.requiredBranch.read();
transitiveEditor.api.requiredLeaf.read();

ParentPlugin.extend({
  // @ts-expect-error Relationship membership is fixed at plugin creation.
  dependencies: [RequiredLeafPlugin],
});

ParentPlugin.configure({
  // @ts-expect-error Relationship membership is fixed at plugin creation.
  dependencies: [RequiredLeafPlugin],
});

const DisabledAtCreationPlugin = createBasePlugin({
  enabled: false,
  key: 'disabledAtCreation',
  api: {
    read: () => true,
  },
});
const disabledAtCreationEditor = createBaseEditor({
  plugins: [DisabledAtCreationPlugin],
});

// @ts-expect-error Descriptor-preserving chains retain literal disablement.
disabledAtCreationEditor.api.disabledAtCreation.read();

const ReplacementLeafPlugin = createBasePlugin({
  key: 'requiredLeaf',
  api: {
    readReplacement: () => 'replacement' as const,
  },
});
const replacementEditor = createBaseEditor({
  plugins: [ParentPlugin, ReplacementLeafPlugin],
});

const replacementValue: 'replacement' =
  replacementEditor.api.requiredLeaf.readReplacement();
// @ts-expect-error Whole-descriptor replacement does not leak the dependency default API.
replacementEditor.api.requiredLeaf.read();

void replacementValue;

const ReactRequiredLeafPlugin = createPlatePlugin({
  key: 'reactRequiredLeaf',
  api: {
    read: () => 'react-required' as const,
  },
}).extend(() => ({
  update: () => ({
    runReactRequiredLeaf: () => undefined,
  }),
}));
export const DependencyAwareReactExtensionPlugin = createPlatePlugin({
  dependencies: [ReactRequiredLeafPlugin],
  key: 'dependencyAwareReactExtension',
}).extend(() => ({
  extension: {
    commands: ({ handle }) => [
      handle(editorCommands.insertText, ({ input, state }) => {
        const exactText: string = input.text;

        void exactText;

        return state.transaction((tx) => {
          tx.reactRequiredLeaf.runReactRequiredLeaf();
          // @ts-expect-error Extension transactions expose installed dependency groups only.
          tx.missingDependency.run();
        });
      }),
    ],
  },
}));
export const ReactParentPlugin = createPlatePlugin({
  dependencies: [ReactRequiredLeafPlugin],
  key: 'reactParent',
});

type ReactParentConfig = PluginConfigOf<typeof ReactParentPlugin>;
const exactReactDependencies: readonly [typeof ReactRequiredLeafPlugin] =
  ReactParentPlugin.dependencies;
const reactDependenciesRoundTrip: InferDependencies<ReactParentConfig> =
  exactReactDependencies;

void reactDependenciesRoundTrip;

const reactEditor = createPlateEditor({ plugins: [ReactParentPlugin] });

reactEditor.api.reactRequiredLeaf.read();

const StaticDependencyPlugin = createPlatePlugin({
  key: 'staticDependency',
  api: {
    read: () => true,
  },
});
const ConvertedParentPlugin = toPlatePlugin(ParentPlugin, {
  dependencies: [StaticDependencyPlugin],
});
const convertedEditor = createPlateEditor({
  plugins: [ConvertedParentPlugin],
});

convertedEditor.api.staticDependency.read();
// @ts-expect-error Static conversion replaces the Base dependency tuple.
convertedEditor.api.requiredBranch.read();

toPlatePlugin(
  ParentPlugin,
  // @ts-expect-error Runtime conversion callbacks cannot change topology.
  () => ({ dependencies: [StaticDependencyPlugin] })
);

const ConvertedExtensionInferencePlugin = toPlatePlugin(
  ParentPlugin,
  ({ editor }) => ({
    extension: {
      commands: ({ around }) => [
        around(editorCommands.insertText, ({ input, next, state }) => {
          const exactText: string = input.text;

          void exactText;
          void state.selection();

          return next();
        }),
      ],
      corrections: [
        {
          correct({ entry, tx }) {
            void entry[0];
            void tx.nodes.some();
          },
          event: 'content',
        },
      ],
      on: {
        commit({ commit }) {
          void commit.tags;
          editor.api.requiredBranch.read();
        },
      },
    },
  })
);
const convertedExtensionInferenceEditor = createPlateEditor({
  plugins: [ConvertedExtensionInferencePlugin],
});

convertedExtensionInferenceEditor.api.requiredBranch.read();

const ConvertedDisabledPlugin = toPlatePlugin(DisabledAtCreationPlugin);
const convertedDisabledEditor = createPlateEditor({
  plugins: [ConvertedDisabledPlugin],
});

// @ts-expect-error Base-to-React conversion preserves literal disablement.
convertedDisabledEditor.api.disabledAtCreation.read();
