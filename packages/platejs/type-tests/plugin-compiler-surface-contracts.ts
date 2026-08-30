// @ts-expect-error compiler-only lowering aliases are not root-public.
type PublicLowerBasePlugin = import('platejs').LowerBasePlugin;
// @ts-expect-error compiler-only normalization aliases are not root-public.
type PublicBaseNormalizer = import('platejs').NormalizeBasePluginInput;
// @ts-expect-error compiler-only React normalization aliases are not root-public.
type PublicPlate = import('platejs/react').NormalizePlatePluginInput;
// oxfmt-ignore
// @ts-expect-error exact dependency carriers stay behind descriptor portals.
type PublicPluginDefinitionLookup = import('platejs').InternalPluginDefinitionOf;

type PublicDefinition = Readonly<{ name: 'publicDefinition' }>;
type PublicBasePlugin = import('platejs').BasePlugin<PublicDefinition>;
type PublicPlatePlugin = import('platejs/react').PlatePlugin<PublicDefinition>;
type PublicPlatePluginContext =
  import('platejs/react').PlatePluginContext<PublicDefinition>;

// @ts-expect-error BasePlugin exposes one exact definition generic.
type BasePluginRejectsCompilerRoot = import('platejs').BasePlugin<
  PublicDefinition,
  PublicDefinition
>;
type PlatePluginRejectsCompilerRoot =
  // @ts-expect-error PlatePlugin exposes one exact definition generic.
  import('platejs/react').PlatePlugin<PublicDefinition, PublicDefinition>;
type PlatePluginContextRejectsEditorOverride =
  // @ts-expect-error PlatePluginContext exposes one exact definition generic.
  import('platejs/react').PlatePluginContext<
    PublicDefinition,
    PublicPlatePluginContext['editor']
  >;

type PublicDefinitionProvider =
  // @ts-expect-error compiler-only definition providers are not root-public.
  import('platejs').PluginDefinitionProvider;
// @ts-expect-error compiler-only definition roots are not root-public.
type PublicDefinitionRoot = import('platejs').PluginDefinitionRoot;
type PublicDefinitionFromRoot =
  // @ts-expect-error compiler-only root extraction is not root-public.
  import('platejs').PluginDefinitionFromRoot;
type PublicBaseContextualDescriptor =
  // @ts-expect-error compiler-only contextual descriptors are not root-public.
  import('platejs').BasePluginContextualDescriptor;
type PublicBaseDescriptorCarrier =
  // @ts-expect-error compiler-only descriptor carriers are not root-public.
  import('platejs').BasePluginDescriptorCarrier;
type PublicBaseRuntimeDescriptor =
  // @ts-expect-error compiler-only runtime descriptors are not root-public.
  import('platejs').BasePluginRuntimeDescriptor;
// @ts-expect-error compiler-only descriptor projections are not root-public.
type PublicBaseDescriptor = import('platejs').BasePluginDescriptor;
// @ts-expect-error compiler-only method graphs are not root-public.
type PublicBaseMethods = import('platejs').BasePluginMethods;
// @ts-expect-error compiler-only merge graphs are not root-public.
type PublicBaseMerge = import('platejs').MergeBasePluginDefinitions;
type PublicBaseConstructorDefinition =
  // @ts-expect-error compiler-only constructor definitions are not root-public.
  import('platejs').BasePluginConstructorDefinition;
type PublicBaseConstructorProvider =
  // @ts-expect-error compiler-only constructor providers are not root-public.
  import('platejs').BasePluginConstructorProvider;
type PublicBaseConstructorResult =
  // @ts-expect-error compiler-only constructor results are not root-public.
  import('platejs').BasePluginConstructorResult;
type PublicBaseStageDefinition =
  // @ts-expect-error compiler-only stage definitions are not root-public.
  import('platejs').BasePluginStageDefinition;
// @ts-expect-error compiler-only stage results are not root-public.
type PublicBaseStage = import('platejs').BasePluginStage;
// @ts-expect-error compiler-only raw-extension results are not root-public.
type PublicExtendedBase = import('platejs').ExtendedBasePlugin;

// @ts-expect-error compiler-only React method graphs are not root-public.
type PublicPlateMethods = import('platejs/react').PlatePluginMethods;
type PublicPlateMerge =
  // @ts-expect-error compiler-only React merge graphs are not root-public.
  import('platejs/react').MergePlatePluginDefinitions;
type PublicPlateConstructorDefinition =
  // @ts-expect-error compiler-only React constructor definitions are not root-public.
  import('platejs/react').PlatePluginConstructorDefinition;
type PublicPlateConstructorProvider =
  // @ts-expect-error compiler-only React constructor providers are not root-public.
  import('platejs/react').PlatePluginConstructorProvider;
type PublicPlateConstructorResult =
  // @ts-expect-error compiler-only React constructor results are not root-public.
  import('platejs/react').PlatePluginConstructorResult;
type PublicPlateStageDefinition =
  // @ts-expect-error compiler-only React stage definitions are not root-public.
  import('platejs/react').PlatePluginStageDefinition;
// @ts-expect-error compiler-only React stage results are not root-public.
type PublicPlateStage = import('platejs/react').PlatePluginStage;
type PublicExtendedPlate =
  // @ts-expect-error compiler-only React raw-extension results are not root-public.
  import('platejs/react').ExtendedPlatePlugin;
type PublicPlateAdapterProvider =
  // @ts-expect-error compiler-only adapter providers are not root-public.
  import('platejs/react').PlatePluginAdapterProvider;
// @ts-expect-error compiler-only adapter results are not root-public.
type PublicToPlateResult = import('platejs/react').ToPlatePluginResult;
type PublicToPlateAdapterResult =
  // @ts-expect-error compiler-only adapted results are not root-public.
  import('platejs/react').ToPlatePluginAdapterResult;
type PublicToConfiguredPlateResult =
  // @ts-expect-error compiler-only configured adapter results are not root-public.
  import('platejs/react').ToConfiguredPlatePluginResult;

export type CompilerAliasesArePrivate = [
  PublicLowerBasePlugin,
  PublicBaseNormalizer,
  PublicPlate,
  PublicPluginDefinitionLookup,
  PublicBasePlugin,
  PublicPlatePlugin,
  PublicPlatePluginContext,
  BasePluginRejectsCompilerRoot,
  PlatePluginRejectsCompilerRoot,
  PlatePluginContextRejectsEditorOverride,
  PublicDefinitionProvider,
  PublicDefinitionRoot,
  PublicDefinitionFromRoot,
  PublicBaseContextualDescriptor,
  PublicBaseDescriptorCarrier,
  PublicBaseRuntimeDescriptor,
  PublicBaseDescriptor,
  PublicBaseMethods,
  PublicBaseMerge,
  PublicBaseConstructorDefinition,
  PublicBaseConstructorProvider,
  PublicBaseConstructorResult,
  PublicBaseStageDefinition,
  PublicBaseStage,
  PublicExtendedBase,
  PublicPlateMethods,
  PublicPlateMerge,
  PublicPlateConstructorDefinition,
  PublicPlateConstructorProvider,
  PublicPlateConstructorResult,
  PublicPlateStageDefinition,
  PublicPlateStage,
  PublicExtendedPlate,
  PublicPlateAdapterProvider,
  PublicToPlateResult,
  PublicToPlateAdapterResult,
  PublicToConfiguredPlateResult,
];
