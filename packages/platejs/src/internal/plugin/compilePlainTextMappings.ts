import {
  serializeStructuralPlainText,
  type StructuralPlainTextEncodeContext,
  type StructuralPlainTextResult,
} from 'plitejs/internal';

import type { ContentSlice, EditorCoreStateView } from '../../facade';
import type { Editor } from '../../lib/editor';
import type { AnyBasePlugin } from '../../lib/plugin';
import type { PlainTextEncodeContext } from '../../lib/plugin/PlainTextNodeMapping';
import { getPlateNodeMappingContributions } from './collectPlateNodeMappings';
import {
  getCompiledPlateModel,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from './compilePlateModel';
import {
  createPluginFormatModelView,
  createPluginFormatOperationContext,
} from './pluginFormatOperation';

type ErasedPlainTextNodeMapping = Readonly<{
  encode: (context: PlainTextEncodeContext<any, any>) => string | undefined;
  priority?: number;
}>;

type CompiledPlainTextNodeMapping = Readonly<{
  mapping: ErasedPlainTextNodeMapping;
  owner: string;
  plugin: AnyBasePlugin;
  schema: ReturnType<typeof getPlateNodeMappingContributions>[number]['schema'];
  targetKey: string | null;
  targetType: string | null;
}>;

const FIELDS = new Set(['encode', 'priority']);
type CompiledPlainTextMappings = Readonly<{
  formats: readonly CompiledPlainTextNodeMapping[];
  getContext: ReturnType<typeof createPluginFormatOperationContext>;
}>;

const CACHE = new WeakMap<object, CompiledPlainTextMappings>();

const validateMapping = (
  owner: string,
  declaration: Readonly<Record<string, unknown>>
): ErasedPlainTextNodeMapping => {
  for (const field of Object.keys(declaration)) {
    if (!FIELDS.has(field)) {
      throw new Error(
        `Plain-text node mapping "${owner}" has unknown field "${field}".`
      );
    }
  }
  if (typeof declaration.encode !== 'function') {
    throw new Error(`Plain-text node mapping "${owner}" must define encode.`);
  }
  if (
    declaration.priority !== undefined &&
    !Number.isFinite(declaration.priority)
  ) {
    throw new Error(
      `Plain-text node mapping "${owner}" priority must be finite.`
    );
  }

  return declaration as ErasedPlainTextNodeMapping;
};

const compile = (editor: Editor) => {
  const cached = CACHE.get(editor);

  if (cached) return cached;
  const formats = Object.freeze(
    getPlateNodeMappingContributions(editor, 'plainText')
      .map((contribution) => {
        const plugin = getCompiledPlatePlugin(editor, contribution.owner);

        if (!plugin) {
          throw new Error(
            `Plain-text node mapping owner "${contribution.owner}" is not installed.`
          );
        }

        return Object.freeze({
          mapping: validateMapping(
            contribution.owner,
            contribution.declaration
          ),
          owner: contribution.owner,
          plugin,
          schema: contribution.schema,
          targetKey: contribution.targetKey,
          targetType: contribution.targetType,
        });
      })
      .sort(
        (left, right) =>
          (right.mapping.priority ?? 0) - (left.mapping.priority ?? 0) ||
          left.owner.localeCompare(right.owner)
      )
  );

  const compiled = Object.freeze({
    formats,
    getContext: createPluginFormatOperationContext(
      editor,
      getCompiledPlateModel(editor),
      getPlateRuntime(editor).pluginList
    ),
  });

  CACHE.set(editor, compiled);

  return compiled;
};

const matches = (
  compiled: CompiledPlainTextNodeMapping,
  context: StructuralPlainTextEncodeContext
) =>
  compiled.targetType ===
    ('type' in context.node ? context.node.type : undefined) ||
  (compiled.targetKey !== null && compiled.targetKey in context.node);

export const serializePlatePlainText = (
  editor: Editor,
  input: Parameters<typeof serializeStructuralPlainText>[0],
  state: EditorCoreStateView
): StructuralPlainTextResult => {
  const { formats, getContext } = compile(editor);
  const document = state.value();
  const operationKey = Object.freeze({});

  return serializeStructuralPlainText(input, state, (context) => {
    for (const compiled of formats) {
      if (!matches(compiled, context)) continue;
      const encoded = compiled.mapping.encode({
        children: context.children,
        ...getContext(compiled.plugin, state, operationKey),
        ...createPluginFormatModelView(
          document,
          context.node,
          state.nodes.path(context.node) ?? context.path,
          context.root
        ),
        rootText: context.rootText,
      });

      if (encoded !== undefined) return encoded;
    }

    return undefined;
  });
};

export const serializePlatePlainTextSlice = (
  editor: Editor,
  slice: ContentSlice,
  state: EditorCoreStateView
) => serializePlatePlainText(editor, slice, state).data;
