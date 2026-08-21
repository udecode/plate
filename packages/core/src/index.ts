/** @platejs-curated-entrypoint */

export type { BaseEditor } from './lib/editor/BaseEditor';
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
  PlatePluginOwnUpdate,
  PlateNodeInsertOptions,
  PlatePluginUpdate,
  PlatePluginReadState,
  PlatePluginState,
  PlatePluginTransaction,
} from './lib/editor/pluginRuntimeTypes';
export type { ElementWith, TextWith } from './lib/plugin/pluginNodeTypes';
export {
  createBaseEditor,
  type BaseEditorOptions,
  type CreateBaseEditorOptions,
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
  RenderStaticNodeWrapper,
  RenderStaticNodeWrapperFunction,
  RenderStaticNodeWrapperProps,
  ResolvedPlatePlugin,
  TextStaticProps,
  PrepareDocument,
  TransformOptions,
} from './lib/plugin/BasePlugin';
export type { HandlerReturnType } from './lib/plugin/HandlerReturnType';
export type * from './lib/plugin/MarkdownNodeCodec';
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
export * from './lib/plugins/getCorePlugins';
export * from './lib/plugins/affinity/index';
export * from './lib/plugins/debug/index';
export * from './lib/plugins/dom/index';
export * from './lib/plugins/element-state/index';
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
export * from './lib/plugins/element-id/index';
export * from './lib/plugins/override/index';
export * from './lib/plugins/paragraph/index';
export type * from './lib/types/index';
export * from './lib/utils/index';
export type { PliteElementProps } from './static/components/plite-nodes';
