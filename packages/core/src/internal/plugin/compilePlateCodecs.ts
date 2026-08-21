import { ContentSlice } from '@platejs/plite';
import type {
  HostCodec,
  HostCodecParseContext,
  HostCodecSchemaTarget,
  HostCodecSerializeContext,
} from '@platejs/plite-dom';
import { hostCodecs } from '@platejs/plite-dom';
import {
  getCompiledSchemaPropertyId,
  reportEditorLifecycleError,
} from '@platejs/plite/internal';

import type { BaseEditor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin';
import { compilePlateHtmlCodec } from '../../lib/plugins/html/HtmlPlugin';
import type {
  CompiledPlateModel,
  CompiledPlateModelBinding,
} from './compilePlateModel';

type CodecDeclaration = Readonly<{
  decode?: (context: HostCodecParseContext) => ContentSlice | null;
  encode?: (context: HostCodecSerializeContext) => string | null;
  priority?: number;
  query?: (context: HostCodecParseContext) => boolean;
  scope?: 'document';
}>;

type CompiledCodecDeclaration = Readonly<{
  claims: readonly HostCodecSchemaTarget[];
  codecPriority: number;
  decode?: NonNullable<HostCodec['parse']>;
  encode?: NonNullable<HostCodec['serialize']>;
  format: string;
  owner: string;
  query?: NonNullable<HostCodec['query']>;
}>;

const declarationKeys = new Set([
  'decode',
  'encode',
  'priority',
  'query',
  'scope',
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getClaims = (
  owner: string,
  scope: unknown,
  binding: CompiledPlateModelBinding | undefined
): readonly HostCodecSchemaTarget[] => {
  if (scope === 'document') {
    return Object.freeze([{ kind: 'schema' }]);
  }
  if (scope !== undefined) {
    throw new Error(
      `Plate codec owner "${owner}" has unknown scope "${String(scope)}".`
    );
  }

  const claims: HostCodecSchemaTarget[] = [];

  if (binding?.elementType) {
    claims.push({ kind: 'element', type: binding.elementType });
  }
  claims.push(...(binding?.properties ?? []));

  if (claims.length === 0) {
    throw new Error(
      `Plate codec owner "${owner}" must declare an element or property schema binding, or use document scope.`
    );
  }

  return Object.freeze(claims);
};

const compileDeclaration = (
  plugin: AnyBasePlugin,
  model: CompiledPlateModel,
  format: string,
  value: unknown
): CompiledCodecDeclaration => {
  if (!format || !format.includes('/')) {
    throw new Error(
      `Plate codec owner "${plugin.name}" must use a MIME format key.`
    );
  }
  if (!isRecord(value)) {
    throw new Error(
      `Plate codec "${plugin.name}/${format}" must be an object.`
    );
  }

  for (const key of Object.keys(value)) {
    if (!declarationKeys.has(key)) {
      throw new Error(
        `Plate codec "${plugin.name}/${format}" has unknown field "${key}".`
      );
    }
  }

  const declaration = value as CodecDeclaration;

  if (!declaration.decode && !declaration.encode) {
    throw new Error(
      `Plate codec "${plugin.name}/${format}" must define decode or encode.`
    );
  }
  for (const key of ['decode', 'encode', 'query'] as const) {
    if (
      declaration[key] !== undefined &&
      typeof declaration[key] !== 'function'
    ) {
      throw new Error(
        `Plate codec "${plugin.name}/${format}" field "${key}" must be a function.`
      );
    }
  }
  if (
    declaration.priority !== undefined &&
    !Number.isFinite(declaration.priority)
  ) {
    throw new Error(
      `Plate codec "${plugin.name}/${format}" priority must be finite.`
    );
  }

  return Object.freeze({
    claims: getClaims(
      plugin.name,
      declaration.scope,
      model.byName[plugin.name]
    ),
    codecPriority: declaration.priority ?? 0,
    ...(declaration.decode ? { decode: declaration.decode } : {}),
    ...(declaration.encode ? { encode: declaration.encode } : {}),
    format,
    owner: plugin.name,
    ...(declaration.query ? { query: declaration.query } : {}),
  });
};

const compareDeclarations = (
  left: CompiledCodecDeclaration,
  right: CompiledCodecDeclaration
) =>
  right.codecPriority - left.codecPriority ||
  left.owner.localeCompare(right.owner);

const claimKey = (claim: HostCodecSchemaTarget) => {
  if ('kind' in claim && claim.kind === 'schema') {
    return '*';
  }
  if ('kind' in claim && claim.kind === 'element') {
    return `element:${claim.type}`;
  }

  return `property:${claim.placement}:${getCompiledSchemaPropertyId(claim)}`;
};

const claimsOverlap = (
  left: readonly HostCodecSchemaTarget[],
  right: readonly HostCodecSchemaTarget[]
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
  declarations: readonly CompiledCodecDeclaration[],
  direction: 'decode' | 'encode'
) => {
  for (let index = 0; index < declarations.length; index++) {
    const left = declarations[index]!;

    for (const right of declarations.slice(index + 1)) {
      if (
        left.codecPriority === right.codecPriority &&
        claimsOverlap(left.claims, right.claims)
      ) {
        throw new Error(
          `Plate codecs "${left.owner}/${left.format}" and "${right.owner}/${right.format}" have equal priority and competing ${direction} claims.`
        );
      }
    }
  }
};

const mergeClaims = (
  declarations: readonly CompiledCodecDeclaration[]
): readonly HostCodecSchemaTarget[] => {
  const claims = new Map<string, HostCodecSchemaTarget>();

  declarations.forEach((declaration) => {
    declaration.claims.forEach((claim) => {
      claims.set(claimKey(claim), claim);
    });
  });

  return Object.freeze([...claims.values()]);
};

const compileFormat = (
  editor: BaseEditor,
  format: string,
  declarations: readonly CompiledCodecDeclaration[]
): HostCodec => {
  const sorted = [...declarations].sort(compareDeclarations);
  const decoders = sorted.filter((declaration) => declaration.decode);
  const encoders = sorted.filter((declaration) => declaration.encode);

  assertPriorityClaims(decoders, 'decode');
  assertPriorityClaims(encoders, 'encode');

  return Object.freeze({
    format,
    key: `plate:${format}`,
    owns: mergeClaims([...decoders, ...encoders]),
    ...(decoders.length > 0
      ? {
          parse: (context: HostCodecParseContext) => {
            for (const declaration of decoders) {
              if (declaration.query) {
                try {
                  if (!declaration.query(context)) continue;
                } catch (cause) {
                  reportEditorLifecycleError(
                    Object.freeze({
                      cause,
                      editor,
                      extensionName: 'plate:codecs',
                      format,
                      key: `plate:${declaration.owner}:${format}:query`,
                      phase: 'query' as const,
                      source: 'host-codec' as const,
                    })
                  );
                  continue;
                }
              }

              let slice: ContentSlice | null;

              try {
                const decoded = declaration.decode!(context);

                slice =
                  decoded === null ? null : ContentSlice.fromJSON(decoded);
              } catch (cause) {
                reportEditorLifecycleError(
                  Object.freeze({
                    cause,
                    editor,
                    extensionName: 'plate:codecs',
                    format,
                    key: `plate:${declaration.owner}:${format}:decode`,
                    phase: 'parse' as const,
                    source: 'host-codec' as const,
                  })
                );
                continue;
              }

              if (slice) return slice;
            }

            return null;
          },
        }
      : {}),
    ...(encoders.length > 0
      ? {
          serialize: (context: HostCodecSerializeContext) => {
            for (const declaration of encoders) {
              let data: string | null;

              try {
                data = declaration.encode!(context);
              } catch (cause) {
                reportEditorLifecycleError(
                  Object.freeze({
                    cause,
                    editor,
                    extensionName: 'plate:codecs',
                    format,
                    key: `plate:${declaration.owner}:${format}:encode`,
                    phase: 'serialize' as const,
                    source: 'host-codec' as const,
                  })
                );
                continue;
              }

              if (data !== null) return data;
            }

            return null;
          },
        }
      : {}),
  });
};

export const compilePlateCodecs = (
  editor: BaseEditor,
  model: CompiledPlateModel,
  plugins: readonly AnyBasePlugin[]
) => {
  const declarations = plugins.flatMap((plugin) => {
    if (!isRecord(plugin.codecs)) return [];
    const codecs = plugin.codecs;

    return Object.entries(codecs).flatMap(([format, declaration]) => {
      if (format.trim().toLowerCase() === 'text/html') {
        return [];
      }

      if (
        (Array.isArray(declaration) &&
          declaration.every(
            (item) => isRecord(item) && item.kind === 'node'
          )) ||
        (isRecord(declaration) && declaration.kind === 'node')
      ) {
        return [];
      }

      return [compileDeclaration(plugin, model, format, declaration)];
    });
  });

  const byFormat = new Map<string, CompiledCodecDeclaration[]>();
  const ownerFormats = new Set<string>();

  declarations.forEach((declaration) => {
    const ownerFormat = `${declaration.owner}\0${declaration.format}`;

    if (ownerFormats.has(ownerFormat)) {
      throw new Error(
        `Plate codec owner "${declaration.owner}" must declare "${declaration.format}" once with decode and encode in the same object.`
      );
    }
    ownerFormats.add(ownerFormat);

    const formatDeclarations = byFormat.get(declaration.format) ?? [];

    formatDeclarations.push(declaration);
    byFormat.set(declaration.format, formatDeclarations);
  });
  const codecs = [
    compilePlateHtmlCodec(editor, model, plugins),
    ...[...byFormat.entries()]
      .sort(([left], [right]) => right.localeCompare(left))
      .map(([format, formatDeclarations]) =>
        compileFormat(editor, format, formatDeclarations)
      ),
  ];

  return hostCodecs('plate:codecs', codecs);
};
