import type { DefinitionOf } from '@platejs/core';
import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { defineStateField, editorCommands } from '@platejs/plite';
import {
  createPlateEditor,
  createPlatePlugin,
  toPlatePlugin,
  useEditorPlugin,
} from '@platejs/core/react';

export const DeclarationSafeBaseExtensionPlugin = createBasePlugin({
  name: 'declarationSafeBaseExtension',
  initialState: { enabled: true },
})
  .extend(({ store }) => ({
    corrections: [
      {
        correct() {
          void store.get().enabled;
        },
        event: 'content',
      },
    ],
  }))
  .configure(({ store }) => ({
    initialState: { enabled: store.get().enabled },
  }));

export const DeclarationSafeReactExtensionPlugin = createPlatePlugin({
  name: 'declarationSafeReactExtension',
  initialState: { enabled: true },
}).extend(({ store }) => ({
  corrections: [
    {
      correct() {
        void store.get().enabled;
      },
      event: 'content',
    },
  ],
}));

const RequiredLeafPlugin = createBasePlugin({
  api: () => ({
    read: () => 'required' as const,
  }),
  name: 'requiredLeaf',
  update: () => ({
    runRequiredLeaf: () => undefined,
  }),
});

const RequiredBranchPlugin = createBasePlugin({
  api: () => ({
    read: () => 'branch' as const,
  }),
  dependencies: [RequiredLeafPlugin],
  name: 'requiredBranch',
});

export const DependencyAwareBaseExtensionPlugin = createBasePlugin({
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
  dependencies: [RequiredLeafPlugin],
  name: 'dependencyAwareBaseExtension',
});

const portableStateField = defineStateField({
  initial: false,
  key: 'portable-extension-contract',
});

const PortableExplicitPlugin = createBasePlugin({
  api: () => ({
    pluginMethod: (value: 'plugin') => value,
  }),
  name: 'portableExplicit',
  stateFields: [portableStateField],
  update: () => ({
    mutate: (value: 'update') => {
      const exactValue: 'update' = value;

      void exactValue;
    },
  }),
});
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
  api: () => ({ ready: () => true }),
  commands: ({ handle }) => [
    handle(editorCommands.insertText, ({ input, state }) => {
      const exactText: string = input.text;

      void exactText;

      return state.transaction(() => undefined);
    }),
  ],
  name: 'explicitInlineExtension',
});

void ExplicitInlineExtensionPlugin;

const DeclaredApiPlugin = createBasePlugin({
  api: () => ({
    value: () => 'declared' as const,
  }),
  name: 'declaredApi',
});
const declaredRootEditor = createBaseEditor({
  plugins: [DeclaredApiPlugin],
});
const declaredRootValue: 'declared' =
  declaredRootEditor.api.declaredApi.value();

void declaredRootValue;

export const ParentPlugin = createBasePlugin({
  api: ({ editor }) => ({
    readDependencies: () =>
      `${editor.api.requiredBranch.read()}:${editor.api.requiredLeaf.read()}` as const,
  }),
  dependencies: [RequiredBranchPlugin],
  name: 'parent',
  update: ({ tx }) => ({
    runParent: () => {
      tx.requiredLeaf.runRequiredLeaf();
    },
  }),
});

type ParentDefinition = DefinitionOf<typeof ParentPlugin>;
type ParentDependencies = ParentDefinition['dependencies'];
declare const parentDependency: ParentDependencies[0];
const exactParentDependencyName: 'requiredBranch' = parentDependency.name;
const exactRuntimeParentDependencyName: 'requiredBranch' =
  ParentPlugin.dependencies[0].name;

void exactParentDependencyName;
void exactRuntimeParentDependencyName;

const baseEditor = createBaseEditor({ plugins: [ParentPlugin] });

const branchValue: 'branch' = baseEditor.api.requiredBranch.read();
const parentDependencyValue: 'branch:required' =
  baseEditor.api.parent.readDependencies();
const requiredValue: 'required' = baseEditor.api.requiredLeaf.read();

baseEditor.update((tx) => {
  tx.parent.runParent();
  tx.requiredLeaf.runRequiredLeaf();
});

void branchValue;
void parentDependencyValue;
void requiredValue;

const TransitiveParentPlugin = createBasePlugin({
  dependencies: [ParentPlugin],
  name: 'transitiveParent',
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
  api: () => ({
    read: () => true,
  }),
  enabled: false,
  name: 'disabledAtCreation',
});
const disabledAtCreationEditor = createBaseEditor({
  plugins: [DisabledAtCreationPlugin],
});

// @ts-expect-error Descriptor-preserving chains retain literal disablement.
disabledAtCreationEditor.api.disabledAtCreation.read();

const ReplacementLeafPlugin = createBasePlugin({
  api: () => ({
    readReplacement: () => 'replacement' as const,
  }),
  name: 'requiredLeaf',
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
  api: () => ({
    read: () => 'react-required' as const,
  }),
  name: 'reactRequiredLeaf',
  update: () => ({
    runReactRequiredLeaf: () => undefined,
  }),
});
export const DependencyAwareReactExtensionPlugin = createPlatePlugin({
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
  dependencies: [ReactRequiredLeafPlugin],
  name: 'dependencyAwareReactExtension',
});
export const ReactParentPlugin = createPlatePlugin({
  dependencies: [ReactRequiredLeafPlugin],
  name: 'reactParent',
});

type ReactParentDefinition = DefinitionOf<typeof ReactParentPlugin>;
type ReactParentDependencies = ReactParentDefinition['dependencies'];
declare const reactParentDependency: ReactParentDependencies[0];
const exactReactParentDependencyName: 'reactRequiredLeaf' =
  reactParentDependency.name;
const exactRuntimeReactParentDependencyName: 'reactRequiredLeaf' =
  ReactParentPlugin.dependencies[0].name;

void exactReactParentDependencyName;
void exactRuntimeReactParentDependencyName;

const reactEditor = createPlateEditor({ plugins: [ReactParentPlugin] });

reactEditor.api.reactRequiredLeaf.read();

const ConvertedParentPlugin = toPlatePlugin(ParentPlugin);
const convertedEditor = createPlateEditor({
  plugins: [ConvertedParentPlugin],
});

convertedEditor.api.requiredBranch.read();
convertedEditor.update.requiredLeaf.runRequiredLeaf();
const convertedPortal = convertedEditor.plugin(ConvertedParentPlugin);

convertedPortal.update.runParent();
convertedEditor.update.requiredLeaf.runRequiredLeaf();

// @ts-expect-error Consumer portals do not expose the editor.
convertedPortal.editor.update.requiredLeaf.runRequiredLeaf();

// @ts-expect-error Converted portals expose only the owner's declared updates.
convertedPortal.update.missingUpdate();

const useConvertedParentPortalContract = () => {
  const portal = useEditorPlugin(ConvertedParentPlugin);

  portal.editor.update.requiredLeaf.runRequiredLeaf();
  // @ts-expect-error React hook portals exclude unknown dependency updates.
  portal.editor.update.missingDependency.run();
};

void useConvertedParentPortalContract;

const AdapterDependencyPlugin = toPlatePlugin(
  createBasePlugin({
    name: 'adapterDependencyOwner',
  }),
  {
    dependencies: [ReactRequiredLeafPlugin],
  }
);
const adapterDependencyEditor = createPlateEditor({
  plugins: [AdapterDependencyPlugin],
});

adapterDependencyEditor.update.reactRequiredLeaf.runReactRequiredLeaf();
const adapterDependencyPortal = adapterDependencyEditor.plugin(
  AdapterDependencyPlugin
);

// @ts-expect-error Consumer portals do not expose the editor.
adapterDependencyPortal.editor.update.reactRequiredLeaf.runReactRequiredLeaf();

// @ts-expect-error Adapter dependencies do not widen to unknown update methods.
adapterDependencyEditor.update.reactRequiredLeaf.missingUpdate();

const AdapterDependencyA = createPlatePlugin({
  name: 'adapterDependencyA',
  update: () => ({ runA: () => undefined }),
});
const AdapterDependencyB = createPlatePlugin({
  name: 'adapterDependencyB',
  update: () => ({ runB: () => undefined }),
});
const AdapterDependencyC = createPlatePlugin({
  name: 'adapterDependencyC',
  update: () => ({ runC: () => undefined }),
});
const AdapterDependencyD = createPlatePlugin({
  name: 'adapterDependencyD',
  update: () => ({ runD: () => undefined }),
});
const FourDependencyAdapterPlugin = toPlatePlugin(
  createBasePlugin({ name: 'fourDependencyAdapter' }),
  {
    dependencies: [
      AdapterDependencyA,
      AdapterDependencyB,
      AdapterDependencyC,
      AdapterDependencyD,
    ],
  }
);
const fourDependencyAdapterEditor = createPlateEditor({
  plugins: [FourDependencyAdapterPlugin],
});

fourDependencyAdapterEditor.update.adapterDependencyA.runA();
fourDependencyAdapterEditor.update.adapterDependencyB.runB();
fourDependencyAdapterEditor.update.adapterDependencyC.runC();
fourDependencyAdapterEditor.update.adapterDependencyD.runD();

const ConvertedExtensionInferencePlugin = toPlatePlugin(
  ParentPlugin,
  ({ editor }) => ({
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
