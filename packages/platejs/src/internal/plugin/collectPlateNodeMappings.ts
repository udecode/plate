import type { AnyBasePlugin } from '../../lib/plugin';
import { failInvariant } from '../failInvariant';
import {
  type CompiledModelBinding,
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from './compilePlateModel';

export type NodeMappingContribution = Readonly<{
  declaration: Readonly<Record<string, unknown>>;
  format: string;
  owner: string;
  ownerPlugin: AnyBasePlugin;
  /** Element property keys the target plugin's own schema contributes. */
  ownedPropertyKeys: readonly string[];
  schema: CompiledModelBinding['schema'];
  /** Whether the target contributes an element, a mark, or neither. */
  targetKind: CompiledModelBinding['kind'];
  targetKey: string | null;
  targetPlugin: string;
  targetType: string | null;
}>;

const NODE_MAPPING_CACHE = new WeakMap<
  object,
  ReadonlyMap<string, readonly NodeMappingContribution[]>
>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getTargetPlugin = (
  editor: object,
  owner: AnyBasePlugin,
  target: unknown
) => {
  if (target === undefined) return owner;
  if (!isRecord(target) || typeof target.name !== 'string') {
    throw new Error(
      `Plate node mapping owner "${owner.name}" must target a plugin descriptor.`
    );
  }

  return (
    getCompiledPlatePlugin(editor, target.name) ??
    failInvariant('Expected value to be defined')
  );
};

const collect = (editor: object) => {
  const byFormat = new Map<string, NodeMappingContribution[]>();

  getPlateRuntime(editor).pluginList.forEach((owner) => {
    if (!isRecord(owner.formats)) return;
    const { formats } = owner;

    (['markdown', 'plainText'] as const).forEach((format) => {
      const value = formats[format];

      if (value === undefined) return;
      const declarations = Array.isArray(value) ? value : [value];

      declarations.forEach((declaration) => {
        if (!isRecord(declaration)) {
          throw new Error(
            `Plate node mapping "${owner.name}/${format}" must be an object.`
          );
        }

        const target = getTargetPlugin(editor, owner, declaration.target);
        const binding = getCompiledPlateModelBinding(editor, target);

        if (!binding?.elementType && !binding?.propertyKey) {
          throw new Error(
            `Plate node mapping target "${target.name}" must own an element type or property key.`
          );
        }
        const { target: _target, ...publicDeclaration } = declaration;
        const formatContributions = byFormat.get(format) ?? [];

        formatContributions.push(
          Object.freeze({
            declaration: Object.freeze(publicDeclaration),
            format,
            owner: owner.name,
            ownerPlugin: owner,
            ownedPropertyKeys: binding.elementPropertyKeys,
            schema: binding.schema,
            targetKind: binding.kind,
            targetKey: binding.propertyKey,
            targetPlugin: target.name,
            targetType: binding.elementType,
          })
        );
        byFormat.set(format, formatContributions);
      });
    });
  });

  return new Map(
    [...byFormat.entries()].map(([format, declarations]) => [
      format,
      Object.freeze(declarations),
    ])
  );
};

/**
 * Read schema-bound product formats without importing format ASTs.
 *
 * @internal
 */
export const getPlateNodeMappingContributions = (
  editor: object,
  format: string
): readonly NodeMappingContribution[] => {
  let byFormat = NODE_MAPPING_CACHE.get(editor);

  if (!byFormat) {
    byFormat = collect(editor);
    NODE_MAPPING_CACHE.set(editor, byFormat);
  }

  return byFormat.get(format) ?? [];
};
