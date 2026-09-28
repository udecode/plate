import type { Node as UnistNode } from 'unist';

import {
  type Editor,
  type MarkdownDecodeContext,
  type MarkdownEncodeContext,
  type MarkdownMarkWrapper,
  type MarkdownRefusal,
  type Descendant,
  PLUGINS,
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
import type { MdRootContent } from '../mdast';
import { convertNodesSerialize } from '../serializer/convertNodesSerialize';
import {
  isMdFlowContent,
  isMdPhrasingContent,
} from '../serializer/mdastContent';
import {
  reportOmittedProperties,
  trackPropertyReads,
} from '../serializer/reportOmittedProperties';
import type {
  DeserializeMdContext,
  MdMarks,
  SerializeMdContext,
} from '../types';
import {
  decodeMarkdownTagProperties,
  encodeMarkdownTagAttributes,
  readMarkdownTagAttributes,
} from './markdownAttributes';
import {
  readPlainMarkdownInlineContent,
  serializeUnknownMdxNode,
  toMarkdownCaptionContent,
} from './markdownDocument';
import { markdownIntrinsicDecoders } from './markdownIntrinsics';
import {
  MARKDOWN_TAG_NAME,
  type MarkdownTagElement,
  type MarkdownTagKind,
  type MarkdownTagRegistry,
} from './markdownTags';

type BivariantCallback<TArgs extends readonly unknown[], TResult> = {
  bivarianceHack(...args: TArgs): TResult;
}['bivarianceHack'];

type MarkdownDecodeResult =
  | Descendant
  | Descendant[]
  | MarkdownRefusal
  | unknown
  | undefined;

type ErasedMarkdownNodeMapping = Readonly<{
  decode?: BivariantCallback<[MarkdownDecodeContext], MarkdownDecodeResult>;
  encode?: BivariantCallback<
    [MarkdownEncodeContext],
    MdRootContent | MarkdownRefusal | undefined
  >;
  mark?: boolean;
  nestedTags?: readonly string[];
  node?: string;
  priority?: number;
  tag?: string;
  wrap?: BivariantCallback<
    [MarkdownEncodeContext & Readonly<{ value: unknown }>],
    MarkdownMarkWrapper | MarkdownRefusal | undefined
  >;
}>;

type ErasedMarkdownEncoder = BivariantCallback<
  [MarkdownEncodeContext & Readonly<{ value?: unknown }>],
  MarkdownMarkWrapper | MarkdownRefusal | MdRootContent | undefined
>;

type CompiledMarkdownNodeMapping = Readonly<{
  getFormatContext: ReturnType<typeof createPluginFormatOperationContext>;
  mapping: ErasedMarkdownNodeMapping;
  owner: string;
  plugin: AnyBasePlugin;
  targetKey: string | null;
  targetPlugin: string;
  targetType: string | null;
}>;

/** One decoder on a selector: a feature mapping or a built-in. */
type MarkdownDecoder = Readonly<{
  decode: (
    node: UnistNode,
    marks: MdMarks,
    options: DeserializeMdContext
  ) => MarkdownDecodeResult;
  mark: boolean;
  owner: string;
  priority: number;
  targetKey: string | null;
}>;

type MarkdownEncoder = (
  node: Descendant,
  options: SerializeMdContext
) => MdRootContent | undefined;

export type CompiledMarkdownMappings = Readonly<{
  decodeByNode: ReadonlyMap<string, readonly MarkdownDecoder[]>;
  decodeByTag: ReadonlyMap<string, readonly MarkdownDecoder[]>;
  encodeByMark: ReadonlyMap<string, MarkdownEncoder>;
  encodeByType: ReadonlyMap<string, MarkdownEncoder>;
  tags: MarkdownTagRegistry;
}>;

const MARKDOWN_MAPPING_FIELDS = new Set([
  'decode',
  'encode',
  'mark',
  'nestedTags',
  'node',
  'priority',
  'tag',
  'wrap',
]);

// The persisted block-identity wrapper; compatible reads only.
const BLOCK_ID_TAG = 'block';

const validateTagName = (owner: string, name: unknown) => {
  if (typeof name !== 'string' || !MARKDOWN_TAG_NAME.test(name)) {
    throw new Error(
      `Markdown node mapping "${owner}" tag "${String(name)}" must match ${MARKDOWN_TAG_NAME}.`
    );
  }
  if (name === BLOCK_ID_TAG) {
    throw new Error(
      `Markdown node mapping "${owner}" cannot claim the reserved "${BLOCK_ID_TAG}" tag.`
    );
  }
};
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
  if (!declaration.decode && !declaration.encode && !declaration.wrap) {
    throw new Error(
      `Markdown node mapping "${owner}" must define decode, encode or wrap.`
    );
  }
  for (const direction of ['decode', 'encode', 'wrap'] as const) {
    if (
      declaration[direction] !== undefined &&
      typeof declaration[direction] !== 'function'
    ) {
      throw new Error(
        `Markdown node mapping "${owner}" field "${direction}" must be a function.`
      );
    }
  }
  if (declaration.node !== undefined && declaration.tag !== undefined) {
    throw new Error(
      `Markdown node mapping "${owner}" must select one of "node" or "tag".`
    );
  }
  if (
    declaration.decode !== undefined &&
    typeof declaration.node !== 'string' &&
    declaration.tag === undefined
  ) {
    throw new Error(
      `Markdown node mapping "${owner}" must select its decode source with "node" or "tag".`
    );
  }
  if (declaration.tag !== undefined) validateTagName(owner, declaration.tag);
  if (declaration.nestedTags !== undefined) {
    if (
      declaration.tag === undefined ||
      !Array.isArray(declaration.nestedTags)
    ) {
      throw new Error(
        `Markdown node mapping "${owner}" can declare nestedTags only beside "tag".`
      );
    }
    declaration.nestedTags.forEach((name) => validateTagName(owner, name));
  }
  if (declaration.mark !== undefined && typeof declaration.mark !== 'boolean') {
    throw new Error(`Markdown node mapping "${owner}" mark must be a boolean.`);
  }
  if (declaration.mark === true && declaration.priority !== undefined) {
    throw new Error(
      `Markdown node mapping "${owner}" is a mark mapping; mark mappings compose and take no priority.`
    );
  }
  if (declaration.mark === true && declaration.encode !== undefined) {
    throw new Error(
      `Markdown node mapping "${owner}" is a mark mapping; use wrap instead of encode.`
    );
  }
  if (declaration.mark !== true && declaration.wrap !== undefined) {
    throw new Error(
      `Markdown node mapping "${owner}" can declare wrap only when mark is true.`
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

const refusals = new WeakSet<object>();

const refuse = (message: string): MarkdownRefusal => {
  const refusal = Object.freeze({ message });

  refusals.add(refusal);

  return refusal as unknown as MarkdownRefusal;
};

const refusalMessage = (value: unknown): string | undefined =>
  typeof value === 'object' && value !== null && refusals.has(value)
    ? (value as { message: string }).message
    : undefined;

const isTagNode = (node: UnistNode): node is MarkdownTagElement =>
  node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';

const createCommonContext = (
  compiled: CompiledMarkdownNodeMapping,
  options: DeserializeMdContext | SerializeMdContext
) => ({
  ...compiled.getFormatContext(
    compiled.plugin,
    options.state,
    options.operation
  ),
  isBlock: options.isBlock,
  isInline: options.isInline,
});

const createDecodeContext = (
  compiled: CompiledMarkdownNodeMapping,
  node: UnistNode,
  marks: MdMarks,
  options: DeserializeMdContext
): MarkdownDecodeContext => ({
  ...createCommonContext(compiled, options),
  build: (child, nextMarks = marks) =>
    buildSlateNode(child, nextMarks, options),
  caption: (children) => toMarkdownCaptionContent(options, [...children]),
  decode: (children, nextMarks = marks) =>
    convertChildrenDeserialize([...children], nextMarks, options),
  decodeNodes: (children, nextMarks = marks) =>
    convertNodesDeserialize([...children], nextMarks, options),
  marks,
  node,
  readTagAttributes: (tag) => {
    const target = tag ?? (isTagNode(node) ? node : undefined);

    if (!target) return { attributes: {}, properties: {} };
    const attributes = readMarkdownTagAttributes(target);

    return {
      attributes,
      properties: decodeMarkdownTagProperties(
        options.state,
        compiled.targetType,
        attributes,
        (key) =>
          options.report({
            code: 'markdown-property-omitted',
            key,
            message: `Markdown attribute "${key}" on <${target.name}> is not a valid value and was omitted.`,
            owner: compiled.owner,
            phase: 'parse',
            reason: 'invalid',
            severity: 'warning',
            source: options.sourceLocation(target),
          })
      ),
    };
  },
  refuse,
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
});

const createEncodeContext = (
  compiled: CompiledMarkdownNodeMapping,
  node: Descendant,
  options: SerializeMdContext,
  view: Descendant = node
): MarkdownEncodeContext => ({
  ...createCommonContext(compiled, options),
  ...createPluginFormatModelView(
    options.document,
    node,
    options.modelLocation(node)?.path ??
      failInvariant('Markdown encode node is missing its model path.'),
    options.modelLocation(node)?.root ?? 'main'
  ),
  encode: (children) => convertNodesSerialize(children, options),
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
  encodeAttributes: (properties) =>
    encodeMarkdownTagAttributes(
      options.state,
      'type' in node && typeof node.type === 'string' ? node.type : null,
      properties
    ),
  isFlow: isMdFlowContent,
  isPhrasing: isMdPhrasingContent,
  node: view,
  preserveEmptyParagraphs: options.preserveEmptyParagraphs,
  readPlainInline: readPlainMarkdownInlineContent,
  refuse,
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

const createEncoder =
  (
    compiled: CompiledMarkdownNodeMapping,
    encode: ErasedMarkdownEncoder
  ): MarkdownEncoder =>
  (node, options) => {
    const read = new Set<string>();
    const view = trackPropertyReads(node, read);
    const context = createEncodeContext(compiled, node, options, view);
    let markValue: unknown;

    if (compiled.mapping.mark) {
      const key =
        compiled.targetKey ?? failInvariant('Expected a mark target key.');

      read.add(key);
      markValue = node[key];
    }
    const encoded = encode(
      compiled.mapping.mark ? { ...context, value: markValue } : context
    );
    const refused = refusalMessage(encoded);

    if (refused !== undefined) {
      options.report({
        action: 'dropped',
        code: 'markdown-unsupported-node',
        message: refused,
        model: options.modelLocation(node),
        nodeType: 'type' in node ? String(node.type) : 'text',
        owner: compiled.owner,
        phase: 'serialize',
        severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
      });

      return undefined;
    }
    if (!encoded) {
      throw new Error(
        `Markdown node mapping "${compiled.owner}" returned no encoded node.`
      );
    }
    reportOmittedProperties(node, read, options, compiled.owner);

    return (
      compiled.mapping.mark ? { ...encoded, children: [] } : encoded
    ) as MdRootContent;
  };

const intrinsicDecoder = (decode: MarkdownDecoder['decode']): MarkdownDecoder =>
  Object.freeze({
    decode,
    mark: false,
    owner: 'markdown',
    priority: Number.NEGATIVE_INFINITY,
    targetKey: null,
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
  const model = getCompiledPlateModel(editor);
  const decodeByNode = new Map<string, MarkdownDecoder[]>();
  const decodeByTag = new Map<string, MarkdownDecoder[]>();
  const encodeByMark = new Map<string, MarkdownEncoder>();
  const encodeByType = new Map<string, MarkdownEncoder>();
  const tags = new Map<string, MarkdownTagKind>([[BLOCK_ID_TAG, 'block']]);
  const tagKind = (compiled: CompiledMarkdownNodeMapping): MarkdownTagKind => {
    // Marks and other text properties have no element type: text-level.
    if (compiled.mapping.mark || !compiled.targetType) return 'inline';
    const element = compiled.targetType
      ? (model.contribution.elements?.[compiled.targetType] as
          | Readonly<{ inline?: boolean; void?: unknown }>
          | undefined)
      : undefined;

    return element?.inline === true ||
      element?.void === 'inline' ||
      element?.void === 'markable-inline'
      ? 'inline'
      : 'block';
  };
  const registerTag = (owner: string, name: string, kind: MarkdownTagKind) => {
    const existing = tags.get(name);

    if (existing && existing !== kind) {
      throw new Error(
        `Markdown node mapping "${owner}" declares tag "${name}" as ${kind}, but another mapping declares it ${existing}.`
      );
    }
    tags.set(name, kind);
  };

  const addDecoder = (
    byKind: Map<string, MarkdownDecoder[]>,
    source: string,
    decoder: MarkdownDecoder
  ) => {
    const decoders = byKind.get(source) ?? [];
    const conflict = decoders.find(
      (candidate) =>
        candidate.mark !== decoder.mark ||
        (!decoder.mark && candidate.priority === decoder.priority)
    );

    if (conflict) {
      throw new Error(
        conflict.mark === decoder.mark
          ? `Markdown node mappings "${conflict.owner}" and "${decoder.owner}" have equal-priority decode claims for "${source}".`
          : `Markdown node mappings "${conflict.owner}" and "${decoder.owner}" mix mark and element decoding for "${source}".`
      );
    }
    decoders.push(decoder);
    byKind.set(source, decoders);
  };

  contributions.forEach((compiled) => {
    const { mapping } = compiled;
    const { decode, encode, wrap } = mapping;

    if (mapping.mark && !compiled.targetKey) {
      throw new Error(
        `Markdown node mapping "${compiled.owner}" is a mark mapping but has no schema text-property target.`
      );
    }

    if (decode) {
      addDecoder(
        mapping.tag === undefined ? decodeByNode : decodeByTag,
        mapping.tag ?? mapping.node ?? failInvariant('Expected a selector.'),
        Object.freeze({
          decode: (node, marks, options) =>
            decode(createDecodeContext(compiled, node, marks, options)),
          mark: mapping.mark === true,
          owner: compiled.owner,
          priority: mapping.priority ?? 0,
          targetKey: compiled.targetKey,
        })
      );
      if (mapping.tag !== undefined) {
        registerTag(compiled.owner, mapping.tag, tagKind(compiled));
        mapping.nestedTags?.forEach((name) =>
          registerTag(compiled.owner, name, 'block')
        );
      }
    }
    const encoder = mapping.mark ? wrap : encode;

    if (encoder) {
      const identity =
        compiled.targetType ??
        compiled.targetKey ??
        failInvariant('Expected a mapping target.');
      const encoders = mapping.mark ? encodeByMark : encodeByType;

      if (encoders.has(identity)) {
        throw new Error(
          `Markdown node mappings must declare one encoder for target "${compiled.targetPlugin}".`
        );
      }
      encoders.set(identity, createEncoder(compiled, encoder));
    }
  });

  for (const [kind, decode] of Object.entries(markdownIntrinsicDecoders)) {
    addDecoder(
      decodeByNode,
      kind,
      intrinsicDecoder(decode as MarkdownDecoder['decode'])
    );
  }

  const freeze = (map: Map<string, MarkdownDecoder[]>) =>
    new Map(
      [...map.entries()].map(([source, decoders]) => [
        source,
        Object.freeze(decoders),
      ])
    );
  const compiled = Object.freeze({
    decodeByNode: freeze(decodeByNode),
    decodeByTag: freeze(decodeByTag),
    encodeByMark,
    encodeByType,
    tags,
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

const refusedTagText = (
  node: MarkdownTagElement,
  options: DeserializeMdContext
): Descendant[] => {
  const text = { text: serializeUnknownMdxNode(node) };

  return node.type === 'mdxJsxTextElement'
    ? [text]
    : [
        {
          children: [text],
          type: options.registry.type(PLUGINS.paragraph) ?? 'paragraph',
        },
      ];
};

export const getMarkdownDecoders = (
  compiled: CompiledMarkdownMappings,
  node: UnistNode
) =>
  isTagNode(node)
    ? compiled.decodeByTag.get(node.name ?? '')
    : compiled.decodeByNode.get(node.type);

/**
 * Claim decoders run in priority order until one claims or refuses. Mark
 * decoders all contribute to one mark set, then the children decode once.
 * `undefined` means no decoder accepted the node.
 */
export const runMarkdownDecoders = (
  decoders: readonly MarkdownDecoder[],
  node: UnistNode,
  marks: MdMarks,
  options: DeserializeMdContext
): Descendant[] | undefined => {
  if (decoders[0]?.mark) {
    let marked: MdMarks | undefined;

    for (const decoder of decoders) {
      const contribution = decoder.decode(node, marks, options);

      if (contribution !== undefined) {
        const key =
          decoder.targetKey ?? failInvariant('Expected a mark target key.');

        marked = {
          ...(marked ?? marks),
          [key]: contribution as MdMarks[string],
        };
      }
    }
    if (!marked) return undefined;
    if ('children' in node && Array.isArray(node.children)) {
      return convertChildrenDeserialize(
        node.children as MdRootContent[],
        marked,
        options
      );
    }

    return [
      {
        ...marked,
        text:
          'value' in node && typeof node.value === 'string' ? node.value : '',
      },
    ];
  }

  for (const decoder of decoders) {
    const decoded = decoder.decode(node, marks, options);
    const refused = refusalMessage(decoded);

    if (refused !== undefined) {
      options.report({
        action: isTagNode(node) ? 'replaced' : 'dropped',
        code: 'markdown-unsupported-node',
        message: refused,
        nodeType: isTagNode(node) ? (node.name ?? node.type) : node.type,
        owner: decoder.owner,
        phase: 'parse',
        severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
        source: options.sourceLocation(node),
      });

      return isTagNode(node) ? refusedTagText(node, options) : [];
    }
    if (decoded !== undefined) {
      return Array.isArray(decoded) ? decoded : [decoded as Descendant];
    }
  }

  return undefined;
};
