import { readsAt } from './default-storage';
import {
  type CompiledEditorSchema,
  toCompiledTargetContext,
} from './schema-compiler';

type TreeNode = Readonly<{
  children?: readonly TreeNode[];
  text?: string;
  type?: unknown;
}>;

/** @internal */
export const survivalUnder = <N extends object>(
  goes: (node: N) => boolean,
  wholeWhenRemoved: (node: N) => boolean
) => {
  const memo = new WeakMap<N, boolean>();
  const survives = (node: N): boolean => {
    let value = memo.get(node);

    if (value === undefined) {
      const { children, text } = node as TreeNode;

      value =
        typeof text === 'string'
          ? !goes(node)
          : !goes(node) ||
            (!wholeWhenRemoved(node) &&
              ((children ?? []) as readonly N[]).some(liveContent));
      memo.set(node, value);
    }

    return value;
  };
  const liveContent = (node: N): boolean => {
    const { text } = node as TreeNode;

    return typeof text === 'string'
      ? !goes(node) && text !== ''
      : survives(node);
  };

  return { liveContent, survives };
};

/** @internal */
export type Survival<N extends object> = ReturnType<typeof survivalUnder<N>>;

/** @internal */
export const leftWithNoGridPart = <N extends object>(
  holdsParts: (node: N) => boolean,
  element: N,
  children: readonly N[],
  goneGridPart: (child: N) => boolean
) => holdsParts(element) && children.length > 0 && children.every(goneGridPart);

/** @internal */
export type GridRoles = Readonly<{
  holdsParts: (node: object) => boolean;
  isPart: (node: object) => boolean;
  roleOf: (node: object) => 'cell' | 'grid' | 'row' | null;
  spansOf: (node: object) => readonly unknown[];
}>;

const GRID_ROLES = new WeakMap<CompiledEditorSchema, GridRoles>();

/** @internal */
export const gridRolesOf = (schema: CompiledEditorSchema): GridRoles => {
  let roles = GRID_ROLES.get(schema);

  if (!roles) {
    const gridOf = (node: object) => {
      const { type } = node as TreeNode;
      const structure =
        typeof type === 'string'
          ? schema.elements.byType.get(type)?.structure
          : undefined;

      return structure?.kind === 'grid' ? structure : null;
    };
    const roleOf = (node: object) => gridOf(node)?.role ?? null;

    roles = {
      holdsParts: (node) => {
        const role = roleOf(node);

        return role === 'grid' || role === 'row';
      },
      isPart: (node) => roleOf(node) !== null,
      roleOf,
      spansOf: (node) => {
        const grid = gridOf(node);
        const props = node as Readonly<Record<string, unknown>>;
        const context = toCompiledTargetContext(String(props.type));

        return [grid?.columnSpan?.key, grid?.rowSpan?.key].map((key) =>
          key === undefined ? undefined : readsAt(schema, props, key, context)
        );
      },
    };
    GRID_ROLES.set(schema, roles);
  }

  return roles;
};

/** @internal */
export const gridPartsOf = (schema: CompiledEditorSchema) =>
  gridRolesOf(schema).isPart;

/** @internal */
export const gridHoldersOf = (schema: CompiledEditorSchema) =>
  gridRolesOf(schema).holdsParts;
