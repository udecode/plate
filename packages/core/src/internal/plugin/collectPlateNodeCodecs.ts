import type { Value } from '@platejs/plite';

import type { BaseEditor } from '../../lib/editor';
import type { AnyBasePlugin, AnyBasePluginDefinition } from '../../lib/plugin';
import { getCompiledPlatePlugin, getPlateRuntime } from './compilePlateModel';

export type PlateNodeCodecContribution = Readonly<{
  declaration: Readonly<Record<string, unknown>>;
  format: string;
  owner: string;
  targetPluginName: string;
  targetType: string;
}>;

const NODE_CODEC_CACHE = new WeakMap<
  object,
  ReadonlyMap<string, readonly PlateNodeCodecContribution[]>
>();

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const getTargetPlugin = <V extends Value, P extends AnyBasePluginDefinition>(
  editor: BaseEditor<V, P>,
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

const collect = <V extends Value, P extends AnyBasePluginDefinition>(
  editor: BaseEditor<V, P>
) => {
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
        const { target: _target, ...publicDeclaration } = declaration;
        const formatContributions = byFormat.get(format) ?? [];

        formatContributions.push(
          Object.freeze({
            declaration: Object.freeze(publicDeclaration),
            format,
            owner: owner.name,
            targetPluginName: target.name,
            targetType: target.type,
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

/** @internal Read schema-bound product codecs without importing format ASTs. */
export const getPlateNodeCodecContributions = <
  V extends Value,
  P extends AnyBasePluginDefinition,
>(
  editor: BaseEditor<V, P>,
  format: string
): readonly PlateNodeCodecContribution[] => {
  let byFormat = NODE_CODEC_CACHE.get(editor);

  if (!byFormat) {
    byFormat = collect(editor);
    NODE_CODEC_CACHE.set(editor, byFormat);
  }

  return byFormat.get(format) ?? [];
};
