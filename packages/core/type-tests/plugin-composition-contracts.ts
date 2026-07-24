import type { AnyPluginConfig, InferDependencies } from '@platejs/core';
import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { editorCommands } from '@platejs/plite';
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
  options: { enabled: true },
})
  .extendExtension(({ getOptions }) => ({
    corrections: [
      {
        correct() {
          void getOptions().enabled;
        },
        event: 'content',
      },
    ],
  }))
  .configure(({ getOptions }) => ({
    options: { enabled: getOptions().enabled },
  }));

export const DeclarationSafeReactExtensionPlugin = createPlatePlugin({
  key: 'declarationSafeReactExtension',
  options: { enabled: true },
}).extendExtension(({ getOptions }) => ({
  corrections: [
    {
      correct() {
        void getOptions().enabled;
      },
      event: 'content',
    },
  ],
}));

const RequiredLeafPlugin = createBasePlugin({
  key: 'requiredLeaf',
})
  .extendApi(() => ({
    read: () => 'required' as const,
  }))
  .extendTx(() => () => ({
    runRequiredLeaf: () => undefined,
  }));

const RequiredBranchPlugin = createBasePlugin({
  dependencies: [RequiredLeafPlugin],
  key: 'requiredBranch',
}).extendApi(() => ({
  read: () => 'branch' as const,
}));

export const DependencyAwareBaseExtensionPlugin = createBasePlugin({
  dependencies: [RequiredLeafPlugin],
  key: 'dependencyAwareBaseExtension',
}).extendExtension(() => ({
  commands: ({ handle }) => [
    handle(editorCommands.insertText, ({ state }) =>
      state.transaction((tx) => {
        tx.requiredLeaf.runRequiredLeaf();
      })
    ),
  ],
}));

export const ParentPlugin = createBasePlugin({
  dependencies: [RequiredBranchPlugin],
  key: 'parent',
}).extendTx(({ editor }) => (tx) => ({
  runParent: () => {
    const branch: 'branch' = editor.api.requiredBranch.read();
    const required: 'required' = editor.api.requiredLeaf.read();

    tx.requiredLeaf.runRequiredLeaf();
    void branch;
    void required;
  },
}));

type ParentConfig = PluginConfigOf<typeof ParentPlugin>;
const exactParentDependencies: readonly [typeof RequiredBranchPlugin] =
  ParentPlugin.dependencies;
const parentDependenciesRoundTrip: InferDependencies<ParentConfig> =
  exactParentDependencies;

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
})
  .extendApi(() => ({
    read: () => true,
  }))
  .withComponent(() => null);
const disabledAtCreationEditor = createBaseEditor({
  plugins: [DisabledAtCreationPlugin],
});

// @ts-expect-error Descriptor-preserving chains retain literal disablement.
disabledAtCreationEditor.api.disabledAtCreation.read();

const ReplacementLeafPlugin = createBasePlugin({
  key: 'requiredLeaf',
}).extendApi(() => ({
  readReplacement: () => 'replacement' as const,
}));
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
})
  .extendApi(() => ({
    read: () => 'react-required' as const,
  }))
  .extendTx(() => () => ({
    runReactRequiredLeaf: () => undefined,
  }));
export const DependencyAwareReactExtensionPlugin = createPlatePlugin({
  dependencies: [ReactRequiredLeafPlugin],
  key: 'dependencyAwareReactExtension',
}).extendExtension(() => ({
  commands: ({ handle }) => [
    handle(editorCommands.insertText, ({ state }) =>
      state.transaction((tx) => {
        tx.reactRequiredLeaf.runReactRequiredLeaf();
      })
    ),
  ],
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
}).extendApi(() => ({
  read: () => true,
}));
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

const ConvertedDisabledPlugin = toPlatePlugin(DisabledAtCreationPlugin);
const convertedDisabledEditor = createPlateEditor({
  plugins: [ConvertedDisabledPlugin],
});

// @ts-expect-error Base-to-React conversion preserves literal disablement.
convertedDisabledEditor.api.disabledAtCreation.read();
