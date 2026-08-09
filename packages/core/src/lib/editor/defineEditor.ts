import type {
  EditorNodeTypeProvider,
  EditorSchemaOverrideInput,
  EditorSchemaContract,
  EditorValueTypeProvider,
  Element,
  Text,
  Value,
  SchemaProperty,
  SchemaPropertyKey,
  SchemaPropertyDefinition,
  SchemaPropertyHandle,
} from '@platejs/plite';

import type { PlateSchemaIdentity } from './BaseEditor';
import type { BasePluginInput } from './pluginRuntimeTypes';

declare const generatedEditorSchema: unique symbol;

export type EditorApplicationSchema = Readonly<{
  overrides?: readonly EditorSchemaOverrideInput[];
  properties?: Readonly<
    Record<string, SchemaProperty | SchemaPropertyDefinition>
  >;
}>;

export type GeneratedEditorSchema = Readonly<{
  plugins: Readonly<
    Record<string, Readonly<{ key: string }> | Readonly<{ type: string }>>
  >;
  properties: Readonly<
    Record<string, SchemaPropertyHandle<SchemaPropertyKey> | undefined>
  >;
}>;

export type EditorDefinition<
  TName extends string = string,
  TPlugins extends readonly BasePluginInput[] = readonly BasePluginInput[],
> = Readonly<{
  name: TName;
  plugins: TPlugins;
  schema?: EditorApplicationSchema;
  schemaIdentity?: PlateSchemaIdentity;
}>;

export type EditorDefinitionInput<
  TPlugins extends readonly BasePluginInput[] = readonly BasePluginInput[],
> = Readonly<{
  plugins: TPlugins;
  schema?: EditorApplicationSchema;
  schemaIdentity?: PlateSchemaIdentity;
}>;

/** Concrete types emitted for one closed editor definition. */
export type GeneratedEditorTypes<
  V extends Value = Value,
  TElement extends Element = Element,
  TText extends Text = Text,
  TSchema extends GeneratedEditorSchema = GeneratedEditorSchema,
  TMutations extends Readonly<Record<string, unknown>> = never,
> = Readonly<{
  element: TElement;
  mutations: TMutations;
  schema: TSchema;
  text: TText;
  value: V;
}>;

type AnyGeneratedEditorTypes = GeneratedEditorTypes<
  Value,
  Element,
  Text,
  GeneratedEditorSchema,
  Readonly<Record<string, unknown>>
>;

/** Runtime schema contract paired with its generated TypeScript declaration. */
export type GeneratedEditorContract<
  TTypes extends AnyGeneratedEditorTypes = GeneratedEditorTypes,
> = Readonly<{
  bindings: TTypes['schema'];
  fingerprint: string;
  schema: EditorSchemaContract;
  /** Type-only witness emitted by the generator. Never read at runtime. */
  types: TTypes;
}>;

export type GeneratedEditorKit<
  TPlugins extends readonly BasePluginInput[],
  TTypes extends AnyGeneratedEditorTypes,
> = TPlugins &
  EditorNodeTypeProvider<() => TTypes['element'], () => TTypes['text']> &
  EditorValueTypeProvider<() => TTypes['value']> &
  Readonly<{
    [generatedEditorSchema]: () => TTypes;
    schema: TTypes['schema'];
  }>;

export type RuntimeGeneratedEditorContract = Readonly<{
  definitionName: string;
  fingerprint: string;
  schema: EditorSchemaContract;
  schemaPolicy?: EditorApplicationSchema;
  schemaIdentity?: PlateSchemaIdentity;
}>;

export type RuntimeEditorDefinition = Readonly<{
  name: string;
  schema?: EditorApplicationSchema;
  schemaIdentity?: PlateSchemaIdentity;
}>;

type GeneratedEditorContractTypes<TContract> =
  TContract extends GeneratedEditorContract<infer TTypes> ? TTypes : never;

const generatedEditorContracts = new WeakMap<
  object,
  RuntimeGeneratedEditorContract
>();
const editorDefinitions = new WeakMap<object, RuntimeEditorDefinition>();

/** Define one closed application editor for deterministic schema generation. */
export const defineEditor = <
  const TName extends string,
  const TPlugins extends readonly BasePluginInput[],
>(
  name: TName,
  definition: EditorDefinitionInput<TPlugins>
): EditorDefinition<TName, TPlugins> => {
  if (name.length === 0) {
    throw new Error('Editor definition name must not be empty.');
  }

  const plugins = Object.freeze([...definition.plugins]) as unknown as TPlugins;
  const result = Object.freeze({
    ...definition,
    name,
    plugins,
  });

  editorDefinitions.set(
    plugins,
    Object.freeze({
      name,
      ...(definition.schema ? { schema: definition.schema } : {}),
      ...(definition.schemaIdentity
        ? { schemaIdentity: definition.schemaIdentity }
        : {}),
    })
  );

  return result;
};

/** Bind generated declarations and a runtime fingerprint to one definition. */
export const bindGeneratedEditor = <
  const TDefinition extends EditorDefinition,
  const TContract extends GeneratedEditorContract<AnyGeneratedEditorTypes>,
>(
  definition: TDefinition,
  contract: TContract
): GeneratedEditorKit<
  TDefinition['plugins'],
  GeneratedEditorContractTypes<TContract>
> => {
  if (contract.fingerprint.length === 0) {
    throw new Error('Generated editor fingerprint must not be empty.');
  }
  if (contract.schema.fingerprint !== contract.fingerprint) {
    throw new Error(
      'Generated editor fingerprint does not match its schema contract.'
    );
  }

  const plugins = Object.assign([...definition.plugins], {
    schema: contract.bindings,
  }) as unknown as GeneratedEditorKit<
    TDefinition['plugins'],
    GeneratedEditorContractTypes<TContract>
  >;

  Object.freeze(plugins);

  generatedEditorContracts.set(
    plugins,
    Object.freeze({
      definitionName: definition.name,
      fingerprint: contract.fingerprint,
      schema: contract.schema,
      ...(definition.schema ? { schemaPolicy: definition.schema } : {}),
      ...(definition.schemaIdentity
        ? { schemaIdentity: definition.schemaIdentity }
        : {}),
    })
  );
  editorDefinitions.set(
    plugins,
    Object.freeze({
      name: definition.name,
      ...(definition.schema ? { schema: definition.schema } : {}),
      ...(definition.schemaIdentity
        ? { schemaIdentity: definition.schemaIdentity }
        : {}),
    })
  );

  return plugins;
};

/** @internal Runtime contract carried by a generated editor kit. */
export const getGeneratedEditorContract = (
  plugins: unknown
): RuntimeGeneratedEditorContract | undefined =>
  typeof plugins === 'object' && plugins !== null
    ? generatedEditorContracts.get(plugins)
    : undefined;

/** @internal Closed editor metadata available before and after generation. */
export const getRuntimeEditorDefinition = (
  plugins: unknown
): RuntimeEditorDefinition | undefined =>
  typeof plugins === 'object' && plugins !== null
    ? editorDefinitions.get(plugins)
    : undefined;

/** @internal Preserve generated metadata when Core prepends implicit plugins. */
export const inheritGeneratedEditorContract = <TTarget extends object>(
  source: unknown,
  target: TTarget
): TTarget => {
  const contract = getGeneratedEditorContract(source);
  const definition = getRuntimeEditorDefinition(source);

  if (contract) generatedEditorContracts.set(target, contract);
  if (definition) editorDefinitions.set(target, definition);

  return target;
};

type GeneratedValueFactory<TPlugins> =
  TPlugins extends EditorValueTypeProvider<infer TValueFactory>
    ? TValueFactory
    : never;

type GeneratedTypesFactory<TPlugins> =
  TPlugins extends Readonly<{
    [generatedEditorSchema]: infer TTypesFactory;
  }>
    ? TTypesFactory
    : never;

/** Concrete generated mutation map, or never for an authored raw kit. */
export type GeneratedEditorMutations<TPlugins> =
  GeneratedTypesFactory<TPlugins> extends () => infer TTypes
    ? TTypes extends AnyGeneratedEditorTypes
      ? TTypes['mutations']
      : never
    : never;

/** Exact generated value, or the broad runtime Value for an authored raw kit. */
export type GeneratedEditorValue<TPlugins> =
  GeneratedValueFactory<TPlugins> extends () => infer V
    ? V extends Value
      ? V
      : Value
    : Value;
