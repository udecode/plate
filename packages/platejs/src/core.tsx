/** @platejs-curated-entrypoint */

export * from 'plitejs';

export type { Editor } from './lib/editor/Editor';
export type { EditorApplicationSchema } from './lib/editor/editorApplicationSchema';
export {
  defineDocumentMigrations,
  migrateDocument,
  type DocumentMigration,
  type DocumentMigrationContext,
  type DocumentMigrationResult,
  type DocumentMigrations,
} from './lib/editor/documentMigrations';
export type {
  BasePluginInput,
  PlateNodeInsertOptions,
  PlatePluginOwnUpdate,
  PlatePluginReadState,
  PlatePluginState,
  PlatePluginTransaction,
  PlatePluginUpdate,
} from './lib/editor/pluginRuntimeTypes';
export {
  createEditor,
  type CreateEditorOptions,
  type EditorValueInput,
} from './lib/editor/withPlite';
export * from './lib/libs/nanoid';
export type {
  BasePlugin,
  BasePluginConfiguration,
  BasePluginContext,
  BasePluginDefinitionInput,
  BasePluginExtendInput,
  BasePluginImplementationContext,
  BasePluginOn,
  BasePluginOverride,
  BasePluginPortal,
  ConfiguredBasePlugin,
  Decorate,
  DeclaredPluginShortcutInput,
  EditorShortcut,
  HtmlAttributes,
  HtmlCodecHooks,
  HtmlContentToken,
  HtmlElementPatch,
  HtmlMatcher,
  HtmlMatchValue,
  HtmlNodeSpec,
  HtmlWrapperSpec,
  InjectNodeProps,
  LeafStaticProps,
  NodeStaticProps,
  PartialBasePlugin,
  PluginShortcutInput,
  PrepareDocument,
  RenderStaticNodeWrapper,
  RenderStaticNodeWrapperFunction,
  RenderStaticNodeWrapperProps,
  ResolvedPlatePlugin,
  TextStaticProps,
  TransformOptions,
} from './lib/plugin/BasePlugin';
export type { HandlerReturnType } from './lib/plugin/HandlerReturnType';
export type * from './lib/plugin/MarkdownNodeCodec';
export type { ElementWith, TextWith } from './lib/plugin/pluginNodeTypes';
export type {
  BaseInjectProps,
  BasePluginDefinition,
  BreakRules,
  DefinitionOf,
  DeleteRules,
  EditOnlyConfig,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
  HtmlParserOptions,
  HtmlPluginContext,
  HtmlPluginRegistry,
  InferApi,
  InferConflicts,
  InferDependencies,
  InferEnabled,
  InferName,
  InferOwnApi,
  InferOwnRead,
  InferOwnUpdate,
  InferPluginReadGroups,
  InferPluginStoreState,
  InferPluginUpdateGroups,
  InferRead,
  InferSelectors,
  InferTargetPlugins,
  InferUpdate,
  MatchRules,
  MergeRules,
  NodeComponent,
  NodeComponents,
  NormalizeRules,
  PlateSchemaElement,
  PluginBaseContext,
  PluginDependency,
  PluginReference,
  PluginSchema,
  PluginSchemaContext,
  PluginSchemaDeclaration,
  PluginSchemaMark,
  PluginSchemaReferences,
  PluginSelector,
  PluginSelectorArgs,
  PluginSelectorMethods,
  PluginSelectorReturn,
  PluginSelectors,
  PluginStore,
  SelectionRules,
  WithAnyName,
  WithRequiredName,
} from './lib/plugin/PluginDefinition';
export { defineBasePlugin } from './lib/plugin/defineBasePlugin';
export * from './lib/plugins/HistoryPlugin';
export * from './lib/plugins/affinity/index';
export * from './lib/plugins/debug/index';
export * from './lib/plugins/dom/index';
export * from './lib/plugins/element-id/index';
export * from './lib/plugins/element-state/index';
export * from './lib/plugins/getCorePlugins';
export {
  collapseWhiteSpace,
  type HtmlApi,
  htmlBrToNewLine,
  HtmlPlugin,
  htmlStringToDOMNode,
  htmlTextNodeToString,
} from './lib/plugins/html/HtmlPlugin';
export { someHtmlElement } from './lib/plugins/html/htmlDom';
export * from './lib/plugins/input-rules/index';
export * from './lib/plugins/override/index';
export * from './lib/plugins/paragraph/index';
export type * from './lib/types/index';
export * from './lib/utils/index';
export * from './utils/index';

export type {
  AnyBasePlugin,
  AnyBasePluginContext,
  AnyBasePluginPortal,
  AnyInjectNodeProps,
  AnyPluginBase,
} from './lib/plugin/BasePlugin';
export type {
  AnyBasePluginDefinition,
  NormalizePluginSelectors,
  NormalizePluginState,
} from './lib/plugin/PluginDefinition';
export { createPluginContext } from './lib/plugin/createPluginContext.internal';
export type { InternalPluginDefinitionOf } from './lib/plugin/pluginDefinitionLookup.internal';
export {
  compileEditorApplicationSchema,
  getCompiledPlateContainerTypes,
  getCompiledPlatePlugin,
  getPlateRuntime,
  getResolvedPluginTargetTypes,
} from './internal/plugin/compilePlateModel';
export {
  getPlateNodeCodecContributions,
  type PlateNodeCodecContribution,
} from './internal/plugin/collectPlateNodeCodecs';
export type { GeneratedEditorTypeProvider } from './internal/editor/generatedEditorTypes';
export type {
  PlatePluginCache,
  PlateRuntime,
} from './internal/plugin/plateRuntime';
export { isNominalPluginDescriptor } from './internal/utils/mergePlugins';
export {
  pipePreparedInsertDataQuery,
  prepareHtmlPluginContext,
  prepareHtmlRegistry,
} from './lib/plugins/html/HtmlPlugin';
export * from './lib/plugins/html/htmlDom';
export type {
  InternalEditorDefinitionElementProperties,
  InternalEditorDefinitionOwnedElementProperties,
  InternalEditorDefinitionTextProperties,
} from './lib/editor/pluginRuntimeTypes';
