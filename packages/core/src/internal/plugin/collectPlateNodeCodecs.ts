import type { AnyBasePlugin } from '../../lib/plugin';
import {
  type CompiledPlateModelBinding,
  getCompiledPlateModelBinding,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from './compilePlateModel';

export type PlateNodeCodecContribution = Readonly<{
  declaration: Readonly<Record<string, unknown>>;
  format: string;
  owner: string;
  schema: CompiledPlateModelBinding['schema'];
  targetKey: string | null;
  targetPlugin: string;
  targetType: string | null;
}>;

const NODE_CODEC_CACHE = new WeakMap<
  object,
  ReadonlyMap<string, readonly PlateNodeCodecContribution[]>
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
      `Plate node codec owner "${owner.name}" must target a plugin descriptor.`
    );
  }

  return getCompiledPlatePlugin(editor, target.name)!;
};

const collect = (editor: object) => {
  const byFormat = new Map<string, PlateNodeCodecContribution[]>();

  getPlateRuntime(editor).pluginList.forEach((owner) => {
    if (!isRecord(owner.codecs)) return;
    const codecs = owner.codecs;

    Object.entries(codecs).forEach(([format, value]) => {
      const declarations = Array.isArray(value) ? value : [value];
      const nodeDeclarations = declarations.filter(
        (declaration) => isRecord(declaration) && declaration.kind === 'node'
      );

      if (Array.isArray(value) && nodeDeclarations.length === 0) {
        return;
      }
      if (nodeDeclarations.length === 0) return;
      if (nodeDeclarations.length !== declarations.length) {
        throw new Error(
          `Plate node codec owner "${owner.name}" must not mix node and host declarations in one "${format}" tuple.`
        );
      }

      nodeDeclarations.forEach((declaration) => {
        if (!isRecord(declaration)) {
          throw new Error(
            `Plate node codec "${owner.name}/${format}" must be an object.`
          );
        }

        const target = getTargetPlugin(editor, owner, declaration.target);
        const binding = getCompiledPlateModelBinding(editor, target);

        if (!binding?.elementType && !binding?.propertyKey) {
          throw new Error(
            `Plate node codec target "${target.name}" must own an element type or property key.`
          );
        }
        const { target: _target, ...publicDeclaration } = declaration;
        const formatContributions = byFormat.get(format) ?? [];

        formatContributions.push(
          Object.freeze({
            declaration: Object.freeze(publicDeclaration),
            format,
            owner: owner.name,
            schema: binding.schema,
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
 * Read schema-bound product codecs without importing format ASTs.
 *
 * @internal
 */
export const getPlateNodeCodecContributions = (
  editor: object,
  format: string
): readonly PlateNodeCodecContribution[] => {
  let byFormat = NODE_CODEC_CACHE.get(editor);

  if (!byFormat) {
    byFormat = collect(editor);
    NODE_CODEC_CACHE.set(editor, byFormat);
  }

  return byFormat.get(format) ?? [];
};
