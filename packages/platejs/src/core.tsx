/** @platejs-curated-entrypoint */

export * from 'plitejs';

export type { Editor } from './lib/editor/Editor';
export type { EditorApplicationSchema } from './lib/editor/editorApplicationSchema';
export type {
  BasePluginInput,
  BlockInsertOptions,
  BlockUpsertOptions,
  NodeInsertOptions,
  PluginOwnUpdate,
  PluginReadState,
  PluginState,
  PluginTransaction,
  PluginUpdate,
} from './lib/editor/pluginRuntimeTypes';
export {
  createEditor,
  type CreateEditorOptions,
  type EditorValueInput,
} from './lib/editor/withPlite';
export * from './lib/libs/nanoid';
export type {
  BasePlugin,
  BasePlugin as Plugin,
  BasePluginConfiguration,
  BasePluginContext,
  BasePluginDefinitionInput as PluginDefinitionInput,
  BasePluginDefinitionInput,
  BasePluginExtendInput,
  BasePluginImplementationContext,
  BasePluginPortal as PluginPortal,
  BasePluginOn,
  BasePluginOverride,
  BasePluginPortal,
  ConfiguredBasePlugin,
  Decorate,
  DeclaredPluginShortcutInput,
  EditorShortcut,
  HtmlAttributes,
  HtmlContentToken,
  HtmlElementPatch,
  HtmlMappingDiagnosticInput,
  HtmlMatcher,
  HtmlMatchValue,
  HtmlNodeSpec,
  HtmlWrapperSpec,
  InjectNodeProps,
  LeafStaticProps,
  NodeStaticProps,
  PartialBasePlugin,
  PluginFormatContext,
  PluginFormatModelView,
  PluginFormatRegistry,
  PluginFormatSchemaView,
  PluginShortcutInput,
  RenderStaticNodeWrapper,
  RenderStaticNodeWrapperFunction,
  RenderStaticNodeWrapperProps,
  TextStaticProps,
  TransformOptions,
} from './lib/plugin/BasePlugin';
export type { HandlerReturnType } from './lib/plugin/HandlerReturnType';
export type * from './lib/plugin/MarkdownNodeMapping';
export type * from './lib/plugin/PlainTextNodeMapping';
export type {
  ElementWith,
  PluginFormatNode,
  TextWith,
} from './lib/plugin/pluginNodeTypes';
export type {
  BaseInjectProps,
  BasePluginDefinition,
  BreakRules,
  DefinitionOf,
  DeleteRules,
  EditOnlyConfig,
  GetInjectNodePropsOptions,
  GetInjectNodePropsReturnType,
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
  MergeRules,
  NodeComponent,
  NormalizeRules,
  PluginSchemaElement,
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
  RuleDecision,
  SelectionRules,
  StructuralRuleEditor,
  StructuralRuleContext,
  WithAnyName,
  WithRequiredName,
} from './lib/plugin/PluginDefinition';
export { definePlugin } from './lib/plugin/definePlugin';
export * from './lib/plugins/HistoryPlugin';
export * from './lib/plugins/affinity/index';
export * from './lib/plugins/debug/index';
export type {
  AutoScrollChangeKind,
  AutoScrollChangesMap,
  AutoScrollOptions,
  AutoScrollUpdate,
  DomApi,
  DomPluginState,
  DomPluginUpdate,
  AutoScrollApi,
  ScrollIntoViewTarget,
  ScrollMode,
} from './lib/plugins/dom/DOMPlugin';
export * from './lib/plugins/element-id/index';
export * from './lib/plugins/element-state/index';
export {
  collapseWhiteSpace,
  htmlBrToNewLine,
  HtmlPlugin,
  htmlTextNodeToString,
} from './lib/plugins/html/HtmlPlugin';
export { someHtmlElement } from './lib/plugins/html/htmlDom';
export * from './lib/plugins/input-rules/index';
export * from './lib/plugins/paragraph/index';
export type * from './lib/types/index';
export * from './lib/utils/index';
export * from './utils/index';

export { isNominalPluginDescriptor } from './internal/utils/mergePlugins';
export * from './lib/plugins/html/htmlDom';
