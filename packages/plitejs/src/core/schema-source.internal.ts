import type { BaseElement } from '../interfaces/element';
import type {
  EditorSchemaDeclaration,
  EditorSchemaPlugin,
} from '../interfaces/schema';
import type { BaseText } from '../interfaces/text';

/**
 * Deferred exact schema declaration witness carried by host descriptors.
 *
 * @internal
 */
export interface EditorSchemaSourceProvider<
  TDeclarationFactory extends () => EditorSchemaDeclaration =
    () => EditorSchemaDeclaration,
> {
  readonly '~schema.source': TDeclarationFactory;
}

/** Descriptor shape accepted by schema inference utilities. */
export type EditorSchemaSource =
  | EditorSchemaSourceProvider
  | Readonly<{
      schema:
        | EditorSchemaDeclaration
        | ((...args: any[]) => EditorSchemaDeclaration);
    }>;

/** @internal */
export interface SchemaNodeTypeProvider<
  TElement extends BaseElement = BaseElement,
  TText extends BaseText = BaseText,
> {
  readonly element: () => TElement;
  readonly text: () => TText;
}

/** @internal */
export type SchemaElementInNode<TNode> = '~schema.node' extends keyof TNode
  ? NonNullable<TNode[Extract<'~schema.node', keyof TNode>]> extends Readonly<{
      element: infer TElement;
    }>
    ? TElement extends () => infer TElementResult
      ? Extract<TElementResult, BaseElement> &
          Pick<TNode, Extract<'~schema.node', keyof TNode>>
      : never
    : never
  : never;

/** @internal */
export type SchemaTextInNode<TNode> = '~schema.node' extends keyof TNode
  ? NonNullable<TNode[Extract<'~schema.node', keyof TNode>]> extends Readonly<{
      text: infer TText;
    }>
    ? TText extends () => infer TTextResult
      ? Extract<TTextResult, BaseText> &
          Pick<TNode, Extract<'~schema.node', keyof TNode>>
      : never
    : never
  : never;

declare const EDITOR_SCHEMA_VALUE: unique symbol;

/** @internal */
export type SchemaValueBrand<TProvider> = Readonly<{
  [EDITOR_SCHEMA_VALUE]?: TProvider;
}>;

/**
 * Non-recursive schema descendant lookup for editor API generics.
 *
 * @internal
 */
export type SchemaDescendantInValue<V extends readonly unknown[]> =
  0 extends 1 & V
    ? never
    : typeof EDITOR_SCHEMA_VALUE extends keyof V
      ? NonNullable<
          V[Extract<typeof EDITOR_SCHEMA_VALUE, keyof V>]
        > extends Readonly<{
          element: infer TElement;
          text: infer TText;
        }>
        ? Extract<
            | (TElement extends () => infer TElementResult
                ? TElementResult
                : never)
            | (TText extends () => infer TTextResult ? TTextResult : never),
            BaseElement | BaseText
          >
        : never
      : never;

/** @internal */
export interface EditorSchemaPluginProvider<
  TSchemaFactory extends () => EditorSchemaPlugin = () => EditorSchemaPlugin,
> {
  readonly '~schema.plugins': TSchemaFactory;
}
