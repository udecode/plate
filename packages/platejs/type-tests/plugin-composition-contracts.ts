import {
  type DefinitionOf,
  createEditor as createHeadlessEditor,
  definePlugin as defineHeadlessPlugin,
} from 'platejs';
import {
  createEditor,
  definePlugin,
  toReactPlugin,
  useEditor,
} from 'platejs/react';

import { defineStateField, editorCommands } from '../src/core';

export const DeclarationSafeBasePlugin = defineHeadlessPlugin(
  'declarationSafeBasePlugin',
  {
    initialState: { enabled: true },
  }
)
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

export const DeclarationSafeReactPlugin = definePlugin(
  'declarationSafeReactPlugin',
  {
    initialState: { enabled: true },
  }
).extend(({ store }) => ({
  corrections: [
    {
      correct() {
        void store.get().enabled;
      },
      event: 'content',
    },
  ],
}));

const RequiredLeafPlugin = defineHeadlessPlugin('requiredLeaf', {
  api: () => ({
    read: () => 'required' as const,
  }),
  update: () => ({
    runRequiredLeaf: () => undefined,
  }),
});

const RequiredBranchPlugin = defineHeadlessPlugin('requiredBranch', {
  api: () => ({
    read: () => 'branch' as const,
  }),
  dependencies: [RequiredLeafPlugin],
});

export const DependencyAwareBasePlugin = defineHeadlessPlugin(
  'dependencyAwareBasePlugin',
  {
    commands: ({ handle }) => [
      handle(editorCommands.insertText, ({ input, state }) => {
        const exactText: string = input.text;

        void exactText;

        return state.transaction((tx) => {
          tx.requiredLeaf.runRequiredLeaf();
          // @ts-expect-error Plugin transactions expose installed dependency groups only.
          tx.missingDependency.run();
        });
      }),
    ],
    dependencies: [RequiredLeafPlugin],
  }
);

const portableStateField = defineStateField({
  initial: false,
  key: 'portable-plugin-contract',
});

const PortableExplicitPlugin = defineHeadlessPlugin('portableExplicit', {
  api: () => ({
    pluginMethod: (value: 'plugin') => value,
  }),
  stateFields: [portableStateField],
  update: () => ({
    mutate: (value: 'update') => {
      const exactValue: 'update' = value;

      void exactValue;
    },
  }),
});
const portableExplicitEditor = createHeadlessEditor({
  plugins: [PortableExplicitPlugin],
});
const portablePluginValue: 'plugin' = portableExplicitEditor
  .plugin(PortableExplicitPlugin)
  .api.pluginMethod('plugin');

portableExplicitEditor.update.portableExplicit.mutate('update');
// @ts-expect-error Built plugins do not claim undeclared root API members.
void portableExplicitEditor.api.portableExplicit.undeclaredRoot;
// @ts-expect-error Built plugins do not claim undeclared root state groups.
void portableExplicitEditor.state.portableExplicit;
void portablePluginValue;

const ExplicitInlinePlugin = defineHeadlessPlugin('explicitInlinePlugin', {
  api: () => ({ ready: () => true }),
  commands: ({ handle }) => [
    handle(editorCommands.insertText, ({ input, state }) => {
      const exactText: string = input.text;

      void exactText;

      return state.transaction(() => undefined);
    }),
  ],
});

void ExplicitInlinePlugin;

const DeclaredApiPlugin = defineHeadlessPlugin('declaredApi', {
  api: () => ({
    value: () => 'declared' as const,
  }),
});
const declaredRootEditor = createHeadlessEditor({
  plugins: [DeclaredApiPlugin],
});
const declaredRootValue: 'declared' =
  declaredRootEditor.api.declaredApi.value();

void declaredRootValue;

export const ParentPlugin = defineHeadlessPlugin('parent', {
  api: ({ editor }) => ({
    readDependencies: () =>
      `${editor.api.requiredBranch.read()}:${editor.api.requiredLeaf.read()}` as const,
  }),
  dependencies: [RequiredBranchPlugin],
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

const baseEditor = createHeadlessEditor({ plugins: [ParentPlugin] });

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

const TransitiveParentPlugin = definePlugin('transitiveParent', {
  dependencies: [ParentPlugin],
});
const transitiveEditor = createHeadlessEditor({
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

const DisabledAtCreationPlugin = definePlugin('disabledAtCreation', {
  api: () => ({
    read: () => true,
  }),
  enabled: false,
});
const disabledAtCreationEditor = createHeadlessEditor({
  plugins: [DisabledAtCreationPlugin],
});

// @ts-expect-error Descriptor-preserving chains retain literal disablement.
disabledAtCreationEditor.api.disabledAtCreation.read();

const ReplacementLeafPlugin = definePlugin('requiredLeaf', {
  api: () => ({
    readReplacement: () => 'replacement' as const,
  }),
});
const replacementEditor = createHeadlessEditor({
  plugins: [ParentPlugin, ReplacementLeafPlugin],
});

const replacementValue: 'replacement' =
  replacementEditor.api.requiredLeaf.readReplacement();
// @ts-expect-error Whole-descriptor replacement does not leak the dependency default API.
replacementEditor.api.requiredLeaf.read();

void replacementValue;

const ReactRequiredLeafPlugin = definePlugin('reactRequiredLeaf', {
  api: () => ({
    read: () => 'react-required' as const,
  }),
  update: () => ({
    runReactRequiredLeaf: () => undefined,
  }),
});
export const DependencyAwareReactPlugin = definePlugin(
  'dependencyAwareReactPlugin',
  {
    commands: ({ handle }) => [
      handle(editorCommands.insertText, ({ input, state }) => {
        const exactText: string = input.text;

        void exactText;

        return state.transaction((tx) => {
          tx.reactRequiredLeaf.runReactRequiredLeaf();
          // @ts-expect-error Plugin transactions expose installed dependency groups only.
          tx.missingDependency.run();
        });
      }),
    ],
    dependencies: [ReactRequiredLeafPlugin],
  }
);
export const ReactParentPlugin = definePlugin('reactParent', {
  dependencies: [ReactRequiredLeafPlugin],
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

const reactEditor = createEditor({ plugins: [ReactParentPlugin] });

reactEditor.api.reactRequiredLeaf.read();

const ConvertedParentPlugin = toReactPlugin(ParentPlugin);
const convertedEditor = createEditor({
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
  const portal = useEditor().plugin(ConvertedParentPlugin);

  portal.update.runParent();
  // @ts-expect-error React consumer portals do not expose the editor.
  portal.editor.update.requiredLeaf.runRequiredLeaf();
  // @ts-expect-error React hook portals exclude unknown updates.
  portal.update.missingUpdate();
};

void useConvertedParentPortalContract;

const AdapterDependencyPlugin = toReactPlugin(
  definePlugin('adapterDependencyOwner', {}),
  {
    dependencies: [ReactRequiredLeafPlugin],
  }
);
const adapterDependencyEditor = createEditor({
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

const AdapterDependencyA = definePlugin('adapterDependencyA', {
  update: () => ({ runA: () => undefined }),
});
const AdapterDependencyB = definePlugin('adapterDependencyB', {
  update: () => ({ runB: () => undefined }),
});
const AdapterDependencyC = definePlugin('adapterDependencyC', {
  update: () => ({ runC: () => undefined }),
});
const AdapterDependencyD = definePlugin('adapterDependencyD', {
  update: () => ({ runD: () => undefined }),
});
const FourDependencyAdapterPlugin = toReactPlugin(
  definePlugin('fourDependencyAdapter', {}),
  {
    dependencies: [
      AdapterDependencyA,
      AdapterDependencyB,
      AdapterDependencyC,
      AdapterDependencyD,
    ],
  }
);
const fourDependencyAdapterEditor = createEditor({
  plugins: [FourDependencyAdapterPlugin],
});

fourDependencyAdapterEditor.update.adapterDependencyA.runA();
fourDependencyAdapterEditor.update.adapterDependencyB.runB();
fourDependencyAdapterEditor.update.adapterDependencyC.runC();
fourDependencyAdapterEditor.update.adapterDependencyD.runD();

const ConvertedPluginInferencePlugin = toReactPlugin(
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
const convertedPluginInferenceEditor = createEditor({
  plugins: [ConvertedPluginInferencePlugin],
});

convertedPluginInferenceEditor.api.requiredBranch.read();

const ConvertedDisabledPlugin = toReactPlugin(DisabledAtCreationPlugin);
const convertedDisabledEditor = createEditor({
  plugins: [ConvertedDisabledPlugin],
});

// @ts-expect-error Base-to-React conversion preserves literal disablement.
convertedDisabledEditor.api.disabledAtCreation.read();
