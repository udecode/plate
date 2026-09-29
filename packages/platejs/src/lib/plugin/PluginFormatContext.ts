import type {
  DescendantIn,
  EditorCoreStateView,
  EditorDocumentValue,
  Element,
  Path,
  RootKey,
  Value,
} from '../../facade';
import type {
  AnyBasePluginDefinition,
  BasePluginDefinition,
  InferPluginStoreState,
  PluginReference,
} from './PluginDefinition';

export type PluginFormatRegistry = Readonly<{
  has: (plugin: PluginReference | string) => boolean;
  type: (plugin: PluginReference | string) => string | undefined;
}>;

export type PluginFormatSchemaView = Pick<
  EditorCoreStateView['schema'],
  | 'allowsElementType'
  | 'element'
  | 'getElementBehavior'
  | 'getProperty'
  | 'getVocabulary'
>;

export type PluginFormatContext<
  C extends AnyBasePluginDefinition = BasePluginDefinition,
> = Readonly<{
  name: C extends Readonly<{ formatOwnerName: infer TName extends string }>
    ? TName
    : C['name'];
  pluginState: Readonly<InferPluginStoreState<C>>;
  registry: PluginFormatRegistry;
  schema: PluginFormatSchemaView;
}>;

export type PluginFormatModelView<V extends Value = Value> = Readonly<{
  document: EditorDocumentValue<V>;
  node: DescendantIn<V>;
  parent: Extract<DescendantIn<V>, Element> | null;
  path: Path;
  previousSibling: DescendantIn<V> | null;
  root: RootKey;
}>;

export type HtmlMappingDiagnosticInput = Readonly<{
  action: 'dropped' | 'replaced' | 'unwrapped';
  kind: 'attribute' | 'element' | 'style';
  message: string;
}>;

export type MarkdownMappingDiagnosticInput = Readonly<{
  action: 'dropped' | 'replaced' | 'unwrapped';
  /**
   * `property` when the content stays and only a property is lost, such as a
   * link destination the editor does not allow: that loss warns under every
   * policy. Defaults to `element`, which follows the loss policy.
   */
  kind?: 'element' | 'property';
  message: string;
  nodeType: string;
}>;
