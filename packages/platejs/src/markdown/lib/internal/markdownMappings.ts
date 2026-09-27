import type { Node as UnistNode } from 'unist';

import type {
  Editor,
  MarkdownDecodeContext,
  MarkdownEncodeContext,
  Descendant,
} from '../../../core';
import { getPlateNodeMappingContributions } from '../../../internal/plugin/collectPlateNodeMappings';
import {
  getCompiledPlateModel,
  getCompiledPlatePluginList,
} from '../../../internal/plugin/compilePlateModel';
import {
  createPluginFormatModelView,
  createPluginFormatOperationContext,
} from '../../../internal/plugin/pluginFormatOperation';
import type { AnyBasePlugin } from '../../../lib/plugin';
import { failInvariant } from '../../internal/failInvariant';
import { convertChildrenDeserialize } from '../deserializer/convertChildrenDeserialize';
import {
  buildSlateNode,
  convertNodesDeserialize,
} from '../deserializer/convertNodesDeserialize';
import { convertTextsDeserialize } from '../deserializer/convertTextsDeserialize';
import type { MdRootContent } from '../mdast';
import {
  parseAttributes,
  propsToAttributes,
} from '../rules/utils/parseAttributes';
import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import {
  isMdFlowContent,
  isMdPhrasingContent,
} from '../serializer/wrapWithBlockId';
import type {
  DeserializeMdContext,
  MdDecoration,
  MdNodeParser,
  MdRules,
  SerializeMdContext,
} from '../types';
import {
  readPlainMarkdownInlineContent,
  serializeUnknownMdxNode,
  toMarkdownCaptionContent,
} from './markdownDocument';

type BivariantCallback<TArgs extends readonly unknown[], TResult> = {
  bivarianceHack(...args: TArgs): TResult;
}['bivarianceHack'];

type ErasedMarkdownNodeMapping = Readonly<{
  decode?: BivariantCallback<
    [MarkdownDecodeContext],
    Descendant | Descendant[] | undefined
  >;
  encode?: BivariantCallback<
    [MarkdownEncodeContext],
    MdRootContent | undefined
  >;
  from?: string;
  mark?: boolean;
  priority?: number;
}>;

type CompiledMarkdownNodeMapping = Readonly<{
  getFormatContext: ReturnType<typeof createPluginFormatOperationContext>;
  mapping: ErasedMarkdownNodeMapping;
  owner: string;
  plugin: AnyBasePlugin;
  targetKey: string | null;
  targetPlugin: string;
  targetType: string | null;
}>;

export type CompiledMarkdownMappings = Readonly<{
  decodeBySource: ReadonlyMap<string, readonly CompiledMarkdownNodeMapping[]>;
  rules: MdRules;
}>;

const MARKDOWN_MAPPING_FIELDS = new Set([
  'decode',
  'encode',
  'from',
  'mark',
  'priority',
]);
const compiledMarkdownMappingsCache = new WeakMap<
  object,
  CompiledMarkdownMappings
>();
export const markdownMappingsRegistryKey = Symbol(
  'plate.markdownMappingsRegistry'
);

export const getMarkdownMappingsRegistryKey = (state: object) => {
  const key = Reflect.get(state, markdownMappingsRegistryKey);

  if (typeof key !== 'object' || key === null) {
    throw new Error(
      'Markdown plugin state is missing its mapping registry key.'
    );
  }

  return key;
};

const compiledMarkdownMappingsByRegistryKey = new WeakMap<
  object,
  CompiledMarkdownMappings
>();

const compareMappings = (
  left: CompiledMarkdownNodeMapping,
  right: CompiledMarkdownNodeMapping
) =>
  (right.mapping.priority ?? 0) - (left.mapping.priority ?? 0) ||
  left.owner.localeCompare(right.owner) ||
  left.targetPlugin.localeCompare(right.targetPlugin);

const validateMapping = (
  owner: string,
  declaration: Readonly<Record<string, unknown>>
): ErasedMarkdownNodeMapping => {
  for (const field of Object.keys(declaration)) {
    if (!MARKDOWN_MAPPING_FIELDS.has(field)) {
      throw new Error(
        `Markdown node mapping "${owner}" has unknown field "${field}".`
      );
    }
  }
  if (!declaration.decode && !declaration.encode) {
    throw new Error(
      `Markdown node mapping "${owner}" must define decode or encode.`
    );
  }
  for (const direction of ['decode', 'encode'] as const) {
    if (
      declaration[direction] !== undefined &&
      typeof declaration[direction] !== 'function'
    ) {
      throw new Error(
        `Markdown node mapping "${owner}" field "${direction}" must be a function.`
      );
    }
  }
  if (
    declaration.decode !== undefined &&
    typeof declaration.from !== 'string'
  ) {
    throw new Error(
      `Markdown node mapping "${owner}" must name its decode source with "from".`
    );
  }
  if (
    declaration.priority !== undefined &&
    !Number.isFinite(declaration.priority)
  ) {
    throw new Error(
      `Markdown node mapping "${owner}" priority must be finite.`
    );
  }

  return declaration as ErasedMarkdownNodeMapping;
};

const createCommonContext = (
  compiled: CompiledMarkdownNodeMapping,
  options: DeserializeMdContext | SerializeMdContext
) => ({
  ...compiled.getFormatContext(compiled.plugin, options.state, options),
  isBlock: options.isBlock,
  isInline: options.isInline,
});

const createDecodeContext = (
  compiled: CompiledMarkdownNodeMapping,
  node: UnistNode,
  decoration: MdDecoration,
  options: DeserializeMdContext,
  decode = (
    children: readonly MdRootContent[],
    nextDecoration: MdDecoration = decoration
  ) => convertChildrenDeserialize([...children], nextDecoration, options)
): MarkdownDecodeContext => ({
  ...createCommonContext(compiled, options),
  build: (child, nextDecoration = decoration) =>
    buildSlateNode(child, nextDecoration, options),
  caption: (children) => toMarkdownCaptionContent(options, [...children]),
  decode,
  decodeNodes: (children, nextDecoration = decoration) =>
    convertNodesDeserialize([...children], nextDecoration, options),
  decodeTexts: (child, nextDecoration = decoration) =>
    convertTextsDeserialize(child, nextDecoration, options),
  decoration,
  node,
  parseAttributes: (attributes) => parseAttributes([...attributes]),
  report: (diagnostic) =>
    options.report({
      ...diagnostic,
      code: 'markdown-unsupported-node',
      owner: compiled.owner,
      phase: 'parse',
      severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
      source: options.sourceLocation(node),
    }),
  serializeUnknown: serializeUnknownMdxNode,
  splitLineBreaks: options.splitLineBreaks,
});

const createEncodeContext = (
  compiled: CompiledMarkdownNodeMapping,
  node: Descendant,
  options: SerializeMdContext
): MarkdownEncodeContext => ({
  ...createCommonContext(compiled, options),
  ...createPluginFormatModelView(
    options.document,
    node,
    options.modelLocation(node)?.path ??
      failInvariant('Markdown encode node is missing its model path.'),
    options.modelLocation(node)?.root ?? 'main'
  ),
  encode: (children, conversionOptions) =>
    convertNodesSerialize(
      children,
      options,
      conversionOptions?.isBlock ?? false
    ),
  encodeBlocks: (children) => {
    const encoded = convertNodesSerialize(children, options);

    if (
      !encoded.every(
        (child) =>
          isMdFlowContent(child) &&
          child.type !== 'definition' &&
          child.type !== 'footnoteDefinition'
      )
    ) {
      throw new Error(
        `Markdown node mapping "${compiled.owner}" expected block content.`
      );
    }

    return encoded;
  },
  encodeFlow: (children) => {
    const encoded = convertNodesSerialize(children, options);

    if (!encoded.every(isMdFlowContent)) {
      throw new Error(
        `Markdown node mapping "${compiled.owner}" expected flow content.`
      );
    }

    return encoded;
  },
  encodePhrasing: (children) => {
    const encoded = convertNodesSerialize(children, options);

    if (!encoded.every(isMdPhrasingContent)) {
      throw new Error(
        `Markdown node mapping "${compiled.owner}" expected inline content.`
      );
    }

    return encoded;
  },
  isFlow: isMdFlowContent,
  isPhrasing: isMdPhrasingContent,
  node,
  preserveEmptyParagraphs: options.preserveEmptyParagraphs,
  propsToAttributes,
  readPlainInline: readPlainMarkdownInlineContent,
  report: (diagnostic) =>
    options.report({
      ...diagnostic,
      code: 'markdown-unsupported-node',
      model: options.modelLocation(node),
      owner: compiled.owner,
      phase: 'serialize',
      severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
    }),
  resourceLink: options.remarkStringifyOptions?.resourceLink === true,
});

const createRule = (compiled: CompiledMarkdownNodeMapping): MdNodeParser => ({
  ...(compiled.mapping.mark === undefined
    ? {}
    : { mark: compiled.mapping.mark }),
  ...(compiled.mapping.decode
    ? {
        deserialize: (node, decoration, options) =>
          (
            compiled.mapping.decode ??
            failInvariant('Expected value to be defined')
          )(createDecodeContext(compiled, node, decoration, options)),
      }
    : {}),
  ...(compiled.mapping.encode
    ? {
        serialize: (node, options) => {
          const encoded = (
            compiled.mapping.encode ??
            failInvariant('Expected value to be defined')
          )(createEncodeContext(compiled, node, options));

          if (!encoded) {
            throw new Error(
              `Markdown node mapping "${compiled.owner}" returned no encoded node.`
            );
          }

          return encoded;
        },
      }
    : {}),
});

export const compileMarkdownMappings = (
  editor: Editor
): CompiledMarkdownMappings => {
  const cached = compiledMarkdownMappingsCache.get(editor);

  if (cached) return cached;

  const getFormatContext = createPluginFormatOperationContext(
    editor,
    getCompiledPlateModel(editor),
    getCompiledPlatePluginList(editor)
  );
  const contributions = getPlateNodeMappingContributions(editor, 'markdown')
    .map((contribution): CompiledMarkdownNodeMapping =>
      Object.freeze({
        getFormatContext,
        mapping: validateMapping(contribution.owner, contribution.declaration),
        owner: contribution.owner,
        plugin: contribution.ownerPlugin,
        targetKey: contribution.targetKey,
        targetPlugin: contribution.targetPlugin,
        targetType: contribution.targetType,
      })
    )
    .sort(compareMappings);
  const decodeBySource = new Map<string, CompiledMarkdownNodeMapping[]>();
  const rules: MdRules = {};

  contributions.forEach((compiled) => {
    if (compiled.mapping.decode) {
      const source =
        compiled.mapping.from ?? failInvariant('Expected value to be defined');
      const sourceMappings = decodeBySource.get(source) ?? [];
      const duplicate = sourceMappings.find(
        (candidate) =>
          candidate.targetPlugin === compiled.targetPlugin &&
          (candidate.mapping.priority ?? 0) === (compiled.mapping.priority ?? 0)
      );

      if (duplicate) {
        throw new Error(
          `Markdown node mappings "${duplicate.owner}" and "${compiled.owner}" have equal-priority decode claims for "${source}" and target "${compiled.targetPlugin}".`
        );
      }

      sourceMappings.push(compiled);
      decodeBySource.set(source, sourceMappings);
    }
    if (compiled.mapping.encode || compiled.mapping.mark) {
      const documentIdentity =
        compiled.targetType ??
        compiled.targetKey ??
        failInvariant('Expected value to be defined');

      if (rules[documentIdentity]) {
        throw new Error(
          `Markdown node mappings must declare one encoder/mark owner for target "${compiled.targetPlugin}".`
        );
      }
      rules[documentIdentity] = createRule(compiled);
    }
  });

  const compiled = Object.freeze({
    decodeBySource: new Map(
      [...decodeBySource.entries()].map(([source, formats]) => [
        source,
        Object.freeze(formats),
      ])
    ),
    rules: Object.freeze(rules),
  });

  compiledMarkdownMappingsCache.set(editor, compiled);

  return compiled;
};

export const registerMarkdownMappings = (
  key: object,
  mappings: CompiledMarkdownMappings
) => {
  compiledMarkdownMappingsByRegistryKey.set(key, mappings);
};

export const getRegisteredMarkdownMappings = (
  key: object
): CompiledMarkdownMappings => {
  const mappings = compiledMarkdownMappingsByRegistryKey.get(key);

  if (!mappings) {
    throw new Error(
      'Markdown mappings were not compiled for this operation schema.'
    );
  }

  return mappings;
};

export const runMarkdownDecodeMappings = (
  compiled: CompiledMarkdownMappings,
  source: string,
  node: UnistNode,
  decoration: MdDecoration,
  options: DeserializeMdContext,
  override?: (pluginName: string) => Descendant[] | undefined
) => {
  const mappings = compiled.decodeBySource.get(source) ?? [];
  const sourceChildren =
    'children' in node && Array.isArray(node.children)
      ? node.children
      : undefined;
  const run = (
    index: number,
    nextDecoration: MdDecoration,
    decodeChildren = false
  ) => {
    const mapping = mappings[index];

    if (!mapping) {
      return decodeChildren && sourceChildren
        ? convertChildrenDeserialize(
            sourceChildren as MdRootContent[],
            nextDecoration,
            options
          )
        : undefined;
    }

    const overridden = override?.(mapping.targetPlugin);

    if (overridden !== undefined) return overridden;

    const decoded = (
      mapping.mapping.decode ?? failInvariant('Expected value to be defined')
    )(
      createDecodeContext(
        mapping,
        node,
        nextDecoration,
        options,
        (children, childDecoration = nextDecoration) => {
          if (!mapping.mapping.mark || children !== sourceChildren) {
            return convertChildrenDeserialize(
              [...children],
              childDecoration,
              options
            );
          }

          const child = run(index + 1, childDecoration, true);

          if (child === undefined) return [];

          return Array.isArray(child) ? child : [child];
        }
      )
    );

    if (decoded !== undefined) return decoded;

    return run(index + 1, nextDecoration, decodeChildren);
  };

  return run(0, decoration);
};
