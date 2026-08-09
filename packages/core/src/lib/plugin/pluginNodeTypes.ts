import type {
  Element,
  PropertyValueDescriptor,
  PropertyValueOf,
  SchemaKeyPrefix,
  Text,
} from '@platejs/plite';

import type { AnyBasePlugin } from './BasePlugin';
import type { AnyBasePluginDefinition } from './PluginDefinition';
import type { InternalPluginDefinitionOf } from './pluginDefinitionLookup.internal';
import type { InferPluginWritablePropertyEntries } from './pluginSchemaModel.internal';

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
        InferPluginWritablePropertyEntries<
          Extract<PluginDefinitionOf<TSource>, AnyBasePluginDefinition>
        >,
        Readonly<{ placement: TPlacement }>
      >
  : never;

type SchemaPropertyLocalId<TEntries> =
  TEntries extends Readonly<{
    localId: infer TLocalId extends string;
  }>
    ? TLocalId
    : never;

type SchemaPropertyRequiredLocalId<TEntries> =
  TEntries extends Readonly<{
    key: string;
    localId: infer TLocalId extends string;
  }>
    ? TLocalId
    : never;

type SchemaPropertyEntryForLocalId<TEntries, TLocalId extends string> =
  TEntries extends Readonly<{ localId: TLocalId }> ? TEntries : never;

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
      ? TDescriptor extends Readonly<{
          default: infer TDefault;
          omitDefault: true;
        }>
        ? Exclude<PropertyValueOf<TDescriptor>, TDefault>
        : PropertyValueOf<TDescriptor>
      : never
    : never;

type SchemaPropertyRequiredNames<
  TEntries,
  TRequired extends string,
> = SchemaPropertyEntryName<SchemaPropertyEntryForLocalId<TEntries, TRequired>>;

type Materialize<T> = { [TKey in keyof T]: T[TKey] };

type SchemaPropertyShape<
  TEntries,
  TRequired extends SchemaPropertyRequiredLocalId<TEntries>,
> = Materialize<
  Readonly<{
    [TLocalId in SchemaPropertyLocalId<TEntries> as SchemaPropertyEntryName<
      SchemaPropertyEntryForLocalId<TEntries, TLocalId>
    > extends SchemaPropertyRequiredNames<TEntries, TRequired>
      ? never
      : SchemaPropertyEntryName<
          SchemaPropertyEntryForLocalId<TEntries, TLocalId>
        >]?: SchemaPropertyEntryValue<
      SchemaPropertyEntryForLocalId<TEntries, TLocalId>
    >;
  }> &
    Readonly<{
      [TLocalId in TRequired as SchemaPropertyEntryName<
        SchemaPropertyEntryForLocalId<TEntries, TLocalId>
      >]-?: PresentSchemaPropertyEntryValue<
        SchemaPropertyEntryForLocalId<TEntries, TLocalId>
      >;
    }>
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
