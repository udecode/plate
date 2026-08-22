import type { SchemaTarget } from '../interfaces/schema';
import type {
  EditorSchemaValidationCode,
  EditorSchemaValidationDiagnostic,
  EditorSchemaValidationPropertyContext,
} from '../interfaces/schema-validation';

/**
 * Location carried by runtime schema walkers.
 *
 * @internal
 */
export type EditorSchemaValidationLocation = Readonly<{
  ancestorTypes?: readonly string[];
  nodeType?: string;
  parentType?: string;
  path: readonly number[];
  root: string | null;
}>;

/**
 * Minimal compiled property provenance required by diagnostics.
 *
 * @internal
 */
export type EditorSchemaValidationPropertyCandidate = Readonly<{
  id: string;
  owner: string;
  target: SchemaTarget | null;
}>;

/**
 * Property context carried by runtime schema walkers.
 *
 * @internal
 */
export type EditorSchemaValidationPropertyInput = Readonly<{
  candidates: readonly EditorSchemaValidationPropertyCandidate[];
  key: string;
  placement: 'element' | 'text';
}>;

const freezeTarget = (target: SchemaTarget): SchemaTarget => {
  switch (target.kind) {
    case 'and':
    case 'or': {
      return Object.freeze({
        ...target,
        targets: Object.freeze(target.targets.map(freezeTarget)),
      });
    }
    case 'not':
    case 'parent': {
      return Object.freeze({ ...target, target: freezeTarget(target.target) });
    }
    case 'types': {
      return Object.freeze({
        ...target,
        types: Object.freeze([...target.types]),
      });
    }
    default: {
      return Object.freeze({ ...target });
    }
  }
};

const freezePropertyContext = (
  property: EditorSchemaValidationPropertyContext
): EditorSchemaValidationPropertyContext =>
  Object.freeze({
    extensions: Object.freeze([...new Set(property.extensions)].sort()),
    ids: Object.freeze([...property.ids]),
    key: property.key,
    placement: property.placement,
    targets: Object.freeze(
      property.targets.map((target) =>
        target === null ? null : freezeTarget(target)
      )
    ),
  });

const freezeDiagnostic = (
  diagnostic: EditorSchemaValidationDiagnostic
): EditorSchemaValidationDiagnostic =>
  Object.freeze({
    ...(diagnostic.ancestorTypes
      ? {
          ancestorTypes: Object.freeze([...diagnostic.ancestorTypes]),
        }
      : {}),
    code: diagnostic.code,
    message: diagnostic.message,
    ...(diagnostic.nodeType === undefined
      ? {}
      : { nodeType: diagnostic.nodeType }),
    ...(diagnostic.parentType === undefined
      ? {}
      : { parentType: diagnostic.parentType }),
    path: Object.freeze([...diagnostic.path]),
    ...(diagnostic.property
      ? { property: freezePropertyContext(diagnostic.property) }
      : {}),
    root: diagnostic.root === 'main' ? null : diagnostic.root,
  });

/** Runtime document/fragment validation error with immutable diagnostics. */
export class EditorSchemaValidationError extends Error {
  readonly diagnostics: readonly EditorSchemaValidationDiagnostic[];

  constructor(
    diagnostics:
      | EditorSchemaValidationDiagnostic
      | readonly EditorSchemaValidationDiagnostic[]
      | string,
    options: Readonly<{ cause?: unknown }> = {}
  ) {
    const input =
      typeof diagnostics === 'string'
        ? [
            {
              code: 'invalid-document' as const,
              message: diagnostics,
              path: [],
              root: null,
            },
          ]
        : Array.isArray(diagnostics)
          ? diagnostics
          : [diagnostics];
    const frozen = Object.freeze(input.map(freezeDiagnostic));

    super(frozen.map(({ message }) => message).join('\n'), options);
    this.name = 'EditorSchemaValidationError';
    this.diagnostics = frozen;
  }
}

/**
 * Build one deterministic path-aware runtime schema error.
 *
 * @internal
 */
export const createEditorSchemaValidationError = (
  code: EditorSchemaValidationCode,
  message: string,
  location: EditorSchemaValidationLocation,
  options: Readonly<{
    cause?: unknown;
    property?: EditorSchemaValidationPropertyInput;
  }> = {}
) => {
  const candidates = options.property
    ? [...options.property.candidates].sort((left, right) =>
        left.id.localeCompare(right.id)
      )
    : [];

  return new EditorSchemaValidationError(
    {
      ...(location.ancestorTypes
        ? { ancestorTypes: location.ancestorTypes }
        : {}),
      code,
      message,
      ...(location.nodeType === undefined
        ? {}
        : { nodeType: location.nodeType }),
      ...(location.parentType === undefined
        ? {}
        : { parentType: location.parentType }),
      path: location.path,
      ...(options.property
        ? {
            property: {
              extensions: candidates.map(({ owner }) => owner),
              ids: candidates.map(({ id }) => id),
              key: options.property.key,
              placement: options.property.placement,
              targets: candidates.map(({ target }) => target),
            },
          }
        : {}),
      root: location.root,
    },
    { cause: options.cause }
  );
};
