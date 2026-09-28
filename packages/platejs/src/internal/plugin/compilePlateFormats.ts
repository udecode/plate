import type {
  DataTransferFormat,
  DataTransferDecodeContext,
  DataTransferSchemaClaim,
  DataTransferEncodeContext,
} from '../../dom/plite-dom.internal';
import { dataTransferFormats } from '../../dom/plite-dom.internal';
import { type ContentSlice, schema } from '../../facade';
import type { Editor } from '../../lib/editor';
import type {
  AnyBasePlugin,
  PluginDataTransferDecodeContext,
  PluginDataTransferEncodeContext,
  PluginFormatContext,
} from '../../lib/plugin';
import { compilePlateHtmlFormat } from '../../lib/plugins/html/HtmlPlugin';
import { serializePlatePlainTextSlice } from './compilePlainTextMappings';
import type {
  CompiledPlateModel,
  CompiledModelBinding,
} from './compilePlateModel';
import { createPluginFormatOperationContext } from './pluginFormatOperation';

type FormatDeclaration = Readonly<{
  accept?: (context: PluginDataTransferDecodeContext) => boolean;
  decode?: (context: PluginDataTransferDecodeContext) => ContentSlice | null;
  encode?: (context: PluginDataTransferEncodeContext) => string | null;
  mimeType: string;
  priority?: number;
  scope?: 'document';
}>;

type CompiledFormatDeclaration = Readonly<{
  claims: readonly DataTransferSchemaClaim[];
  formatPriority: number;
  decode?: NonNullable<DataTransferFormat['decode']>;
  encode?: NonNullable<DataTransferFormat['encode']>;
  mimeType: string;
  owner: string;
  accept?: NonNullable<DataTransferFormat['accept']>;
}>;

const declarationKeys = new Set([
  'decode',
  'encode',
  'mimeType',
  'priority',
  'accept',
  'scope',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const formatUnknownValue = (value: unknown): string => {
  if (typeof value === 'string') return value;

  try {
    return JSON.stringify(value) ?? typeof value;
  } catch {
    return typeof value;
  }
};

const getClaims = (
  owner: string,
  scope: unknown,
  binding: CompiledModelBinding | undefined
): readonly DataTransferSchemaClaim[] => {
  if (scope === 'document') {
    return Object.freeze([{ kind: 'schema' }]);
  }
  if (scope !== undefined) {
    throw new Error(
      `Plate format owner "${owner}" has unknown scope "${formatUnknownValue(scope)}".`
    );
  }

  const claims: DataTransferSchemaClaim[] = [];

  if (binding?.elementType) {
    claims.push({ kind: 'element', type: binding.elementType });
  }
  claims.push(...(binding?.properties ?? []));

  if (claims.length === 0) {
    throw new Error(
      `Plate format owner "${owner}" must declare an element or property schema binding, or use document scope.`
    );
  }

  return Object.freeze(claims);
};

const compileDeclaration = (
  plugin: AnyBasePlugin,
  model: CompiledPlateModel,
  getFormatContext: (
    plugin: AnyBasePlugin,
    state: DataTransferDecodeContext['state'],
    operationKey: object
  ) => PluginFormatContext,
  mimeType: string,
  value: unknown
): CompiledFormatDeclaration => {
  if (!mimeType || !mimeType.includes('/')) {
    throw new Error(
      `Plate format owner "${plugin.name}" must use a MIME type.`
    );
  }
  if (!isRecord(value)) {
    throw new Error(
      `Plate format "${plugin.name}/${mimeType}" must be an object.`
    );
  }

  for (const key of Object.keys(value)) {
    if (!declarationKeys.has(key)) {
      throw new Error(
        `Plate format "${plugin.name}/${mimeType}" has unknown field "${key}".`
      );
    }
  }

  const declaration = value as FormatDeclaration;
  const { accept, decode, encode } = declaration;

  if (!decode && !encode) {
    throw new Error(
      `Plate format "${plugin.name}/${mimeType}" must define decode or encode.`
    );
  }
  for (const key of ['decode', 'encode', 'accept'] as const) {
    if (
      declaration[key] !== undefined &&
      typeof declaration[key] !== 'function'
    ) {
      throw new Error(
        `Plate format "${plugin.name}/${mimeType}" field "${key}" must be a function.`
      );
    }
  }
  if (
    declaration.priority !== undefined &&
    !Number.isFinite(declaration.priority)
  ) {
    throw new Error(
      `Plate format "${plugin.name}/${mimeType}" priority must be finite.`
    );
  }

  return Object.freeze({
    claims: getClaims(
      plugin.name,
      declaration.scope,
      model.byName[plugin.name]
    ),
    formatPriority: declaration.priority ?? 0,
    ...(decode
      ? {
          decode: (context: DataTransferDecodeContext) =>
            decode({
              ...context,
              ...getFormatContext(plugin, context.state, context.snapshot),
            }),
        }
      : {}),
    ...(encode
      ? {
          encode: (context: DataTransferEncodeContext) =>
            encode({
              ...context,
              ...getFormatContext(plugin, context.state, context.slice),
            }),
        }
      : {}),
    mimeType,
    owner: plugin.name,
    ...(accept
      ? {
          accept: (context: DataTransferDecodeContext) =>
            accept({
              ...context,
              ...getFormatContext(plugin, context.state, context.snapshot),
            }),
        }
      : {}),
  });
};

const compareDeclarations = (
  left: CompiledFormatDeclaration,
  right: CompiledFormatDeclaration
) =>
  right.formatPriority - left.formatPriority ||
  left.owner.localeCompare(right.owner) ||
  left.mimeType.localeCompare(right.mimeType);

const claimKey = (claim: DataTransferSchemaClaim) => {
  if ('kind' in claim && claim.kind === 'schema') {
    return '*';
  }
  if ('kind' in claim && claim.kind === 'element') {
    return `element:${claim.type}`;
  }

  return `property:${claim.placement}:${schema.handle.property(claim).id}`;
};

const claimsOverlap = (
  left: readonly DataTransferSchemaClaim[],
  right: readonly DataTransferSchemaClaim[]
) => {
  const leftKeys = new Set(left.map(claimKey));
  const rightKeys = new Set(right.map(claimKey));

  return (
    leftKeys.has('*') ||
    rightKeys.has('*') ||
    [...leftKeys].some((key) => rightKeys.has(key))
  );
};

const assertPriorityClaims = (
  declarations: readonly CompiledFormatDeclaration[],
  direction: 'decode' | 'encode'
) => {
  for (let index = 0; index < declarations.length; index++) {
    const left = declarations[index];

    for (const right of declarations.slice(index + 1)) {
      if (
        left.formatPriority === right.formatPriority &&
        claimsOverlap(left.claims, right.claims)
      ) {
        throw new Error(
          `Plate formats "${left.owner}/${left.mimeType}" and "${right.owner}/${right.mimeType}" have equal priority and competing ${direction} claims.`
        );
      }
    }
  }
};

export const compilePlateFormats = (
  editor: Editor,
  model: CompiledPlateModel,
  plugins: readonly AnyBasePlugin[]
) => {
  const getFormatContext = createPluginFormatOperationContext(
    editor,
    model,
    plugins
  );
  const declarations = plugins.flatMap((plugin) => {
    if (!Array.isArray(plugin.dataTransferFormats)) return [];

    return plugin.dataTransferFormats.map((declaration) => {
      if (!isRecord(declaration) || typeof declaration.mimeType !== 'string') {
        throw new Error(
          `Plate data transfer format owner "${plugin.name}" must declare a MIME type.`
        );
      }

      return compileDeclaration(
        plugin,
        model,
        getFormatContext,
        declaration.mimeType,
        declaration
      );
    });
  });

  const byFormat = new Map<string, CompiledFormatDeclaration[]>();
  const ownerFormats = new Set<string>();

  declarations.forEach((declaration) => {
    const ownerFormat = `${declaration.owner}\0${declaration.mimeType}`;

    if (ownerFormats.has(ownerFormat)) {
      throw new Error(
        `Plate format owner "${declaration.owner}" must declare "${declaration.mimeType}" once with decode and encode in the same object.`
      );
    }
    ownerFormats.add(ownerFormat);

    const formatDeclarations = byFormat.get(declaration.mimeType) ?? [];

    formatDeclarations.push(declaration);
    byFormat.set(declaration.mimeType, formatDeclarations);
  });
  for (const formatDeclarations of byFormat.values()) {
    assertPriorityClaims(
      formatDeclarations.filter((declaration) => declaration.decode),
      'decode'
    );
    assertPriorityClaims(
      formatDeclarations.filter((declaration) => declaration.encode),
      'encode'
    );
  }

  const orderedDeclarations = [...declarations]
    .sort(compareDeclarations)
    .reverse();
  const plainTextFormat = Object.freeze({
    mimeType: 'text/plain',
    key: 'plate:structural-plain-text',
    encode: (context: DataTransferEncodeContext) =>
      serializePlatePlainTextSlice(editor, context.slice, context.state),
  }) satisfies DataTransferFormat;

  return Object.freeze([
    dataTransferFormats('plate:structural-plain-text-format', [
      plainTextFormat,
    ]),
    dataTransferFormats('plate:html-format', [
      compilePlateHtmlFormat(editor, model, plugins),
    ]),
    ...orderedDeclarations.map((declaration, index) =>
      dataTransferFormats(`plate:format:${declaration.owner}:${index}`, [
        Object.freeze({
          mimeType: declaration.mimeType,
          key: `plate:${declaration.owner}:${declaration.mimeType}`,
          ...(declaration.accept ? { accept: declaration.accept } : {}),
          ...(declaration.decode ? { decode: declaration.decode } : {}),
          ...(declaration.encode ? { encode: declaration.encode } : {}),
        }),
      ])
    ),
  ]);
};
