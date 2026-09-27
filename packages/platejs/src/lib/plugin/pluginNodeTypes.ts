import type {
  Descendant,
  Element,
  EditorSchemaSourceProvider,
  PropertyValueDescriptor,
  PropertyValueOf,
  PropertyOptionsOf,
  SchemaKeyPrefix,
  SchemaElementShapeFor,
  SchemaElementTypes,
  Text,
} from '../../facade';
import type { AnyBasePlugin } from './BasePlugin';
import type { AnyBasePluginDefinition } from './PluginDefinition';
import type { InternalPluginDefinitionOf } from './pluginDefinitionLookup.internal';
import type {
  InferExactPluginSchemaContribution,
  InferPluginDocumentType,
  InferPluginWritablePropertyEntries,
} from './pluginSchemaModel.internal';

type PluginDefinitionOf<P> =
  InternalPluginDefinitionOf<P> extends infer D
    ? [D] extends [never]
      ? P extends AnyBasePluginDefinition
        ? P
        : P extends AnyBasePlugin
          ? AnyBasePluginDefinition
          : never
      : Extract<D, AnyBasePluginDefinition>
    : never;

type SchemaPropertyDescriptorMap = Readonly<
  Record<string, PropertyValueDescriptor>
>;

type PluginWritablePropertyEntriesOf<D extends AnyBasePluginDefinition> =
  D extends Readonly<{ __pluginWritableProperties: infer TEntry }>
    ? TEntry
    : InferPluginWritablePropertyEntries<D>;

type RawSchemaPropertyEntries<
  TProperties extends SchemaPropertyDescriptorMap,
  TPlacement extends 'element' | 'text',
> = {
  [TLocalId in Extract<keyof TProperties, string>]: Readonly<{
    descriptor: TProperties[TLocalId];
    key: TLocalId;
    localId: TLocalId;
    placement: TPlacement;
  }>;
}[Extract<keyof TProperties, string>];

type SchemaPropertyEntriesOf<
  TSource,
  TPlacement extends 'element' | 'text',
> = TSource extends unknown
  ? [PluginDefinitionOf<TSource>] extends [never]
    ? TSource extends SchemaPropertyDescriptorMap
      ? RawSchemaPropertyEntries<TSource, TPlacement>
      : never
    : Extract<
        PluginWritablePropertyEntriesOf<
          Extract<PluginDefinitionOf<TSource>, AnyBasePluginDefinition>
        >,
        Readonly<{ placement: TPlacement }>
      >
  : never;

type SchemaPropertyRequiredLocalId<TEntries> =
  TEntries extends Readonly<{
    key: string;
    localId: infer TLocalId extends string;
  }>
    ? TLocalId
    : never;

type SchemaPropertyName<TKey> = TKey extends string
  ? TKey
  : TKey extends SchemaKeyPrefix<infer TPrefix>
    ? `${TPrefix}${string}`
    : never;

type SchemaPropertyEntryName<TEntry> =
  TEntry extends Readonly<{
    key: infer TKey;
  }>
    ? SchemaPropertyName<TKey>
    : never;

type SchemaPropertyEntryValue<TEntry> =
  TEntry extends Readonly<{
    descriptor: infer TDescriptor;
  }>
    ? PropertyValueOf<TDescriptor>
    : never;

type PresentSchemaPropertyEntryValue<TEntry> =
  TEntry extends Readonly<{
    descriptor: infer TDescriptor;
  }>
    ? TDescriptor extends PropertyValueDescriptor
      ? TDescriptor extends Readonly<{ omitDefault: true }>
        ? PropertyOptionsOf<TDescriptor> extends {
            default: infer TDefault;
          }
          ? Exclude<PropertyValueOf<TDescriptor>, TDefault>
          : PropertyValueOf<TDescriptor>
        : PropertyValueOf<TDescriptor>
      : never
    : never;

type Materialize<T> = { [TKey in keyof T]: T[TKey] };

type UnionToIntersection<T> = (
  T extends unknown ? (value: T) => void : never
) extends (value: infer TIntersection) => void
  ? TIntersection
  : never;

type SchemaPropertyEntryShape<TEntry, TRequired extends string> =
  TEntry extends Readonly<{
    localId: infer TLocalId extends string;
  }>
    ? TLocalId extends TRequired
      ? Readonly<{
          [
            TName in SchemaPropertyEntryName<TEntry>
          ]-?: PresentSchemaPropertyEntryValue<TEntry>;
        }>
      : Readonly<{
          [
            TName in SchemaPropertyEntryName<TEntry>
          ]?: SchemaPropertyEntryValue<TEntry>;
        }>
    : never;

type SchemaPropertyShape<
  TEntries,
  TRequired extends SchemaPropertyRequiredLocalId<TEntries>,
> = Materialize<
  UnionToIntersection<SchemaPropertyEntryShape<TEntries, TRequired>>
>;

type SchemaPropertySource =
  | AnyBasePlugin
  | AnyBasePluginDefinition
  | SchemaPropertyDescriptorMap;

/**
 * Element narrowed to schema properties contributed by one or more owners.
 * The second generic marks exact authored local IDs known to be present.
 */
export type ElementWith<
  TSource extends SchemaPropertySource,
  TRequired extends SchemaPropertyRequiredLocalId<
    SchemaPropertyEntriesOf<TSource, 'element'>
  > = never,
> = Element &
  SchemaPropertyShape<SchemaPropertyEntriesOf<TSource, 'element'>, TRequired>;

/**
 * Text leaf narrowed to schema properties contributed by one or more owners.
 * The second generic marks exact authored local IDs known to be present.
 */
export type TextWith<
  TSource extends SchemaPropertySource,
  TRequired extends SchemaPropertyRequiredLocalId<
    SchemaPropertyEntriesOf<TSource, 'text'>
  > = never,
> = Text &
  SchemaPropertyShape<SchemaPropertyEntriesOf<TSource, 'text'>, TRequired>;

type FormatContribution<D extends AnyBasePluginDefinition> =
  InferExactPluginSchemaContribution<D>;

type FormatContributionSource<D extends AnyBasePluginDefinition> =
  EditorSchemaSourceProvider<() => FormatContribution<D>>;

type FormatContributionElementType<D extends AnyBasePluginDefinition> = Extract<
  InferPluginDocumentType<D>,
  SchemaElementTypes<FormatContributionSource<D>>
>;

type FormatElementNode<D extends AnyBasePluginDefinition> = [
  FormatContributionElementType<D>,
] extends [never]
  ? never
  : Extract<
      SchemaElementShapeFor<
        FormatContributionSource<D>,
        FormatContributionElementType<D>
      >,
      Element
    >;

type FormatPropertyEntries<
  D extends AnyBasePluginDefinition,
  TPlacement extends 'element' | 'text',
> = Extract<
  InferPluginWritablePropertyEntries<D>,
  Readonly<{ placement: TPlacement }>
>;

/** Node narrowed from the format mapping target's schema contribution. */
export type PluginFormatNode<D extends AnyBasePluginDefinition> = [
  FormatElementNode<D>,
] extends [never]
  ? [FormatPropertyEntries<D, 'text'>] extends [never]
    ? [FormatPropertyEntries<D, 'element'>] extends [never]
      ? Descendant
      : ElementWith<D>
    : [FormatPropertyEntries<D, 'element'>] extends [never]
      ? TextWith<D>
      : TextWith<D> | ElementWith<D>
  : FormatElementNode<D>;
