import type {
  DecoratedRange,
  EditorExtensionReference,
  EditorSchemaExtension,
  EditorSchemaExtensionProvider,
} from "@platejs/plite";
import type {
  EditorExtensionDependencyReferenceFor,
  InternalEditorExtensionDependencyReference,
  InternalEditorExtensionInstalledCapabilitiesOf,
  InternalEditorExtensionTypeProviderOf,
} from "@platejs/plite/internal";

import type {
  AnyBasePluginDefinition,
  BasePluginDefinition,
  InferApi,
  InferConflicts,
  InferDependencies,
  InferEnabled,
  InferRead,
  InferTargetPlugins,
  InferUpdate,
  NormalizePluginState,
  PluginSchemaDeclaration,
  PluginDependency,
  PluginDependencySource,
  PluginReference,
} from "./PluginDefinition";
import type { InternalPluginDefinitionOf } from "./pluginDefinitionLookup.internal";
import type { InferExactPluginSchemaContribution } from "./pluginSchemaModel.internal";

type InstalledCapabilityNames<TCapability> = TCapability extends Readonly<{
  name: infer TName extends PropertyKey;
}>
  ? TName
  : never;

type ExcludeInstalledCapabilityNames<
  TCapability,
  TNames extends PropertyKey
> = TCapability extends unknown
  ? TCapability extends Readonly<{ name: infer TName extends PropertyKey }>
    ? TName extends TNames
      ? never
      : TCapability
    : TCapability
  : never;

type InstalledDependencyCapability<TDependency> = [
  PluginDependencySource<TDependency>
] extends [never]
  ? InternalEditorExtensionInstalledCapabilitiesOf<TDependency>
  : InstalledBasePluginCapabilitiesOf<PluginDependencySource<TDependency>>;

type InstalledDependencyCapabilities<TDependencies extends readonly unknown[]> =
  number extends TDependencies["length"]
    ? InstalledDependencyCapability<TDependencies[number]>
    : TDependencies extends readonly [
        ...infer TPrevious extends readonly unknown[],
        infer TLast
      ]
    ?
        | InstalledDependencyCapability<TLast>
        | ExcludeInstalledCapabilityNames<
            InstalledDependencyCapabilities<TPrevious>,
            InstalledCapabilityNames<TLast>
          >
    : never;

type InstalledBasePluginSchemaCapability<C extends AnyBasePluginDefinition> =
  Readonly<{
    schemaContribution: () => InferExactPluginSchemaContribution<C>;
  }>;

type InstalledBasePluginCapability<
  C extends AnyBasePluginDefinition,
  TSource
> = Readonly<{
  name: C["name"];
}> &
  DefinitionField<C, "api", InferApi<C>> &
  DefinitionField<C, "enabled", InferEnabled<C>> &
  DefinitionField<C, "read", InferRead<C>> &
  InstalledBasePluginSchemaCapability<C> &
  DefinitionField<C, "targetPlugins", InferTargetPlugins<C>> &
  DefinitionField<C, "update", InferUpdate<C>> &
  InternalEditorExtensionTypeProviderOf<TSource>;

type DirectBasePluginDependencyCapability<
  C extends AnyBasePluginDefinition,
  TSource
> = [InferEnabled<C>] extends [false]
  ? Readonly<{
      enabled: false;
      name: C["name"];
    }>
  : InstalledBasePluginCapability<C, TSource>;

type InstalledBasePluginCapabilitiesOf<TDependency> =
  InternalPluginDefinitionOf<TDependency> extends infer D extends AnyBasePluginDefinition
    ? [InferEnabled<D>] extends [false]
      ? never
      :
          | InstalledBasePluginCapability<D, TDependency>
          | ExcludeInstalledCapabilityNames<
              InstalledDependencyCapabilities<InferDependencies<D>>,
              D["name"]
            >
    : never;

/** Compact installed closure carried directly by an exact Plate descriptor. */
export type BasePluginInstalledCapabilityWitness<
  C extends AnyBasePluginDefinition
> = InternalEditorExtensionDependencyReference<
  Readonly<{
    direct: DirectBasePluginDependencyCapability<C, LowerBasePlugin<C>>;
    installed: [InferEnabled<C>] extends [false]
      ? never
      :
          | InstalledBasePluginCapability<C, LowerBasePlugin<C>>
          | ExcludeInstalledCapabilityNames<
              InstalledDependencyCapabilities<InferDependencies<C>>,
              C["name"]
            >;
  }>
>;

/** Compact, nameable install contract for one Plate dependency. */
type BasePluginDependencySchemaReference<TDependency> =
  TDependency extends EditorSchemaExtensionProvider<
    infer TSchema extends EditorSchemaExtension
  >
    ? EditorSchemaExtensionProvider<TSchema>
    : {};

type BasePluginDependencyDefinitionOf<TDependency> = [
  PluginDependencySource<TDependency>
] extends [never]
  ? InternalPluginDefinitionOf<TDependency>
  : PluginDependencySource<TDependency> extends infer TSource
  ? TSource extends AnyBasePluginDefinition
    ? TSource
    : InternalPluginDefinitionOf<TSource>
  : never;

type CompactBasePluginDependencyReferences<TDependencies> =
  TDependencies extends readonly unknown[]
    ? {
        readonly [TIndex in keyof TDependencies]: TDependencies[TIndex] extends PluginReference<
          infer TName
        >
          ? PluginReference<TName> &
              PluginDependency<
                CompactBasePluginDependencyDefinition<
                  BasePluginDependencyDefinitionOf<TDependencies[TIndex]>
                >
              >
          : TDependencies[TIndex] extends EditorExtensionReference
          ? Readonly<Pick<TDependencies[TIndex], "enabled" | "name">> &
              PluginDependency<
                CompactBasePluginDependencyDefinition<
                  BasePluginDependencyDefinitionOf<TDependencies[TIndex]>
                >
              >
          : never;
      }
    : readonly [];

type CompactBasePluginDependencyDefinition<C extends AnyBasePluginDefinition> =
  Readonly<{ name: C["name"] }> &
    DefinitionField<C, "api", InferApi<C>> &
    DefinitionField<C, "enabled", InferEnabled<C>> &
    DefinitionField<C, "read", InferRead<C>> &
    DefinitionField<
      C,
      "schema",
      C extends { schema: infer TSchema } ? TSchema : never
    > &
    DefinitionField<C, "targetPlugins", InferTargetPlugins<C>> &
    DefinitionField<C, "update", InferUpdate<C>> &
    (C extends {
      dependencies: infer TDependencies extends readonly unknown[];
    }
      ? Readonly<{
          dependencies: CompactBasePluginDependencyReferences<TDependencies>;
        }>
      : Readonly<Record<never, never>>);

export type BasePluginDependencyReferenceFor<TDependency> = ([
  InternalPluginDefinitionOf<TDependency>
] extends [never]
  ? EditorExtensionDependencyReferenceFor<TDependency>
  : PluginDependency<
      CompactBasePluginDependencyDefinition<
        InternalPluginDefinitionOf<TDependency>
      >
    >) &
  BasePluginDependencySchemaReference<TDependency>;

export type BasePluginDependencyReferences<
  D extends ReadonlyArray<Readonly<{ name: string }>>
> = {
  readonly [TIndex in keyof D]: D[TIndex] extends PluginReference<infer TName>
    ? PluginReference<TName> & BasePluginDependencyReferenceFor<D[TIndex]>
    : D[TIndex] extends EditorExtensionReference
    ? BasePluginDependencyReferenceFor<D[TIndex]>
    : never;
};

type BasePluginDependencyDescriptor<TDependency> =
  TDependency extends PluginReference<infer TName>
    ? PluginReference<TName>
    : TDependency extends EditorExtensionReference
    ? Readonly<Pick<TDependency, "enabled" | "name">>
    : never;

export type BasePluginDependencyDescriptors<
  D extends ReadonlyArray<EditorExtensionReference | PluginReference>
> = {
  readonly [TIndex in keyof D]: BasePluginDependencyDescriptor<D[TIndex]>;
};

type BaseNativePresenceKey =
  | "activate"
  | "commands"
  | "contributions"
  | "corrections"
  | "effectTypes"
  | "facetProviders"
  | "on"
  | "readMiddleware"
  | "stateFields"
  | "validate";

type DefinitionField<C, TKey extends PropertyKey, TValue> = TKey extends keyof C
  ? Readonly<Record<TKey, TValue>>
  : {};

type LowerNativeFields<C> = Readonly<{
  [TKey in Extract<keyof C, BaseNativePresenceKey>]: true;
}>;

export type LowerBasePlugin<C extends AnyBasePluginDefinition> = Readonly<{
  name: C["name"];
}> &
  DefinitionField<C, "enabled", InferEnabled<C>> &
  DefinitionField<C, "dependencies", InferDependencies<C>> &
  DefinitionField<
    C,
    "conflicts",
    BasePluginDependencyDescriptors<InferConflicts<C>>
  > &
  DefinitionField<C, "schema", InferExactPluginSchemaContribution<C>> &
  DefinitionField<C, "api", InferApi<C>> &
  DefinitionField<C, "read", InferRead<C>> &
  DefinitionField<C, "update", InferUpdate<C>> &
  LowerNativeFields<C>;

type FactoryResult<TValue> = TValue extends (...args: any[]) => infer TResult
  ? TResult
  : TValue;

type ObjectResult<TValue> =
  FactoryResult<TValue> extends infer TResult extends object ? TResult : {};

type InputName<TInput, TFallback extends string = string> = TInput extends {
  name: infer TName extends string;
}
  ? TName
  : TFallback;

type InputInitialState<TInput> = TInput extends {
  initialState: infer TInitialState;
}
  ? NormalizePluginState<ObjectResult<TInitialState>>
  : {};

type InputApi<TInput> = TInput extends { api: infer TApi }
  ? ObjectResult<TApi>
  : {};

type InputRead<TInput> = TInput extends { read: infer TRead }
  ? ObjectResult<TRead>
  : {};

type InputUpdate<TInput> = TInput extends { update: infer TUpdate }
  ? ObjectResult<TUpdate>
  : {};

type DecorationPayload<TRange> = [TRange] extends [never]
  ? {}
  : TRange extends DecoratedRange
  ? Omit<TRange, keyof DecoratedRange>
  : {};

type InputDecoration<TInput> = TInput extends { decorate: infer TDecorate }
  ? Exclude<FactoryResult<TDecorate>, undefined> extends ReadonlyArray<
      infer TRange
    >
    ? DecorationPayload<TRange>
    : {}
  : {};

type InputSelectors<TInput> = TInput extends {
  selectors: infer TSelectors extends object;
}
  ? TSelectors
  : {};

type InputSchema<TInput> = TInput extends { schema: infer TSchema }
  ? Extract<FactoryResult<TSchema>, PluginSchemaDeclaration>
  : never;

type InputDependencies<TInput> = TInput extends {
  dependencies: infer TDependencies extends ReadonlyArray<
    EditorExtensionReference | PluginReference
  >;
}
  ? {
      readonly [TIndex in keyof TDependencies]: TDependencies[TIndex] extends PluginReference<
        infer TName
      >
        ? PluginReference<TName> &
            BasePluginDependencyReferenceFor<TDependencies[TIndex]>
        : TDependencies[TIndex] extends EditorExtensionReference
        ? BasePluginDependencyReferenceFor<TDependencies[TIndex]>
        : never;
    }
  : readonly [];

type InputConflicts<TInput> = TInput extends {
  conflicts: infer TConflicts extends ReadonlyArray<
    EditorExtensionReference | PluginReference
  >;
}
  ? {
      readonly [TIndex in keyof TConflicts]: TConflicts[TIndex] extends PluginReference<
        infer TName
      >
        ? PluginReference<TName> &
            EditorExtensionDependencyReferenceFor<TConflicts[TIndex]>
        : TConflicts[TIndex] extends EditorExtensionReference
        ? EditorExtensionDependencyReferenceFor<TConflicts[TIndex]>
        : never;
    }
  : readonly [];

type InputEnabled<TInput> = TInput extends {
  enabled: infer TEnabled extends boolean;
}
  ? TEnabled
  : boolean;

type BasePluginPresenceField =
  | BaseNativePresenceKey
  | "codecs"
  | "editOnly"
  | "inject"
  | "inputRules"
  | "override"
  | "render"
  | "rules"
  | "shortcuts"
  | "targetPlugins"
  | "prepareDocument"
  | "useHooks";

type NormalizedBasePluginField<
  TInput,
  TKey extends keyof TInput
> = TKey extends "key" | "type"
  ? TInput[TKey]
  : TKey extends "api"
  ? InputApi<TInput>
  : TKey extends "decorate"
  ? InputDecoration<TInput>
  : TKey extends "conflicts"
  ? InputConflicts<TInput>
  : TKey extends "dependencies"
  ? InputDependencies<TInput>
  : TKey extends "enabled"
  ? InputEnabled<TInput>
  : TKey extends "targetPlugins"
  ? TInput[TKey] extends ReadonlyArray<PluginReference | string>
    ? TInput[TKey]
    : ReadonlyArray<PluginReference | string>
  : TKey extends "read"
  ? InputRead<TInput>
  : TKey extends "update"
  ? InputUpdate<TInput>
  : TKey extends "initialState"
  ? InputInitialState<TInput>
  : TKey extends "selectors"
  ? InputSelectors<TInput>
  : TKey extends "schema"
  ? InputSchema<TInput>
  : TKey extends BasePluginPresenceField
  ? true
  : never;

export type NormalizeBasePluginInput<
  TInput,
  TFallbackName extends string = string
> = Readonly<{
  [TKey in keyof TInput as TKey extends keyof BasePluginDefinition
    ? TKey extends "name"
      ? never
      : TKey
    : never]: NormalizedBasePluginField<TInput, TKey>;
}> &
  Readonly<{ name: InputName<TInput, TFallbackName> }>;
