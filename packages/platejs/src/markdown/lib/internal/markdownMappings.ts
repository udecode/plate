import type { Node as UnistNode } from 'unist';

import {
  type Descendant,
  type Editor,
  ElementApi,
  type MarkdownDecodeContext,
  type MarkdownEncodeContext,
  type MarkdownMarkWrapper,
  type MarkdownRefusal,
  PLUGINS,
} from '../../../core';
import {
  getPlateNodeMappingContributions,
  type NodeMappingContribution,
} from '../../../internal/plugin/collectPlateNodeMappings';
import {
  getCompiledPlateModel,
  getCompiledPlatePluginList,
} from '../../../internal/plugin/compilePlateModel';
import {
  createPluginFormatModelView,
  createPluginFormatOperationContext,
} from '../../../internal/plugin/pluginFormatOperation';
import { isScriptUrl } from '../../../internal/utils/urlPolicy';
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
import type {
  DeserializeMdContext,
  MdMarks,
  SerializeMdContext,
} from '../types';
import {
  decodeMarkdownNodeProperties,
  encodeMarkdownNodeAttributes,
  encodeMarkdownTagAttributes,
  type MarkdownOwnedAttribute,
  readMarkdownStyleValue,
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

type MarkdownEncodeResult = MdRootContent | MarkdownRefusal | undefined;

type ErasedMarkdownNodeMapping = Readonly<{
  attributes?: Readonly<Record<string, string>>;
  decode?: BivariantCallback<[MarkdownDecodeContext], MarkdownDecodeResult>;
  encode?: BivariantCallback<[MarkdownEncodeContext], MarkdownEncodeResult>;
  nestedTags?: readonly string[];
  node?: string;
  priority?: number;
  style?: string;
  tag?: string;
  value?: unknown;
  wrap?: BivariantCallback<
    [MarkdownEncodeContext & Readonly<{ value: unknown }>],
    MarkdownMarkWrapper | MarkdownRefusal | undefined
  >;
}>;

type CompiledMarkdownNodeMapping = Readonly<{
  /** Owned property key → the attribute name it is written as. */
  aliases: ReadonlyMap<string, string>;
  getFormatContext: ReturnType<typeof createPluginFormatOperationContext>;
  mapping: ErasedMarkdownNodeMapping;
  owner: string;
  ownedPropertyKeys: ReadonlySet<string>;
  plugin: AnyBasePlugin;
  /** The element target's schema shape; `null` for marks. */
  resolveNode: ((state: SerializeMdContext['state']) => NodeShape) | null;
  targetKey: string | null;
  targetPlugin: string;
  targetType: string | null;
}>;

type TagContent = 'flow' | 'phrasing' | 'text' | 'void';

type NodeShapeProperty = MarkdownOwnedAttribute &
  Readonly<{
    /** Construction materializes this default when the attribute is absent. */
    materialized?: Readonly<{ value: unknown }>;
    required: boolean;
  }>;

type NodeShape = Readonly<{
  content: TagContent;
  inline: boolean;
  owned: readonly NodeShapeProperty[];
  type: string;
}>;

/** One decoder on a selector: a feature mapping or a built-in. */
type MarkdownDecoder = Readonly<{
  decode: (
    node: UnistNode,
    marks: MdMarks,
    options: DeserializeMdContext,
    previousSibling: MdRootContent | null
  ) => MarkdownDecodeResult;
  mark: boolean;
  owner: string;
  priority: number;
  targetKey: string | null;
}>;

/**
 * An element's Markdown output and the properties its encoder represents. The
 * caller reports unclaimed properties once, after composing the claims of
 * every owner that wrote the node, such as a list around an image.
 */
export type MarkdownEncoded = Readonly<{
  claimed: ReadonlySet<string>;
  node: MdRootContent;
  owner: string;
}>;

type MarkdownEncoder = (
  node: Descendant,
  options: SerializeMdContext
) => MarkdownEncoded | undefined;

type MarkdownMarkEncoder = (
  node: Descendant,
  options: SerializeMdContext
) => MdRootContent | undefined;

/**
 * How a mark value is written. Standard containers wrap the encoded text,
 * `inlineCode` turns the innermost text into code, and `wrap` writes a tag.
 */
export type MarkdownMarkWriter = Readonly<{
  /** Whether this writer represents the mark value. */
  accepts: (value: unknown) => boolean;
  kind: 'delete' | 'emphasis' | 'inlineCode' | 'strong' | 'wrap';
  wrap?: MarkdownMarkEncoder;
}>;

export type CompiledMarkdownMappings = Readonly<{
  decodeByNode: ReadonlyMap<string, readonly MarkdownDecoder[]>;
  decodeByTag: ReadonlyMap<string, readonly MarkdownDecoder[]>;
  encodeByType: ReadonlyMap<string, MarkdownEncoder>;
  /** Mark keys in writing order: standard containers first, then tag wrappers. */
  markOrder: readonly string[];
  /** Writers per mark key, in declaration order; the first that accepts wins. */
  markWriters: ReadonlyMap<string, readonly MarkdownMarkWriter[]>;
  tags: MarkdownTagRegistry;
}>;

const MARKDOWN_MAPPING_FIELDS = new Set([
  'attributes',
  'decode',
  'encode',
  'nestedTags',
  'node',
  'priority',
  'style',
  'tag',
  'value',
  'wrap',
]);
const ELEMENT_MAPPING_FIELDS = ['attributes', 'encode', 'priority'] as const;
const MARK_MAPPING_FIELDS = ['style', 'value', 'wrap'] as const;

// Standard Markdown containers a mark can select with `node`.
const MARK_CONTAINERS: ReadonlySet<string> = new Set([
  'delete',
  'emphasis',
  'inlineCode',
  'strong',
]);
// Writing order among containers: inline code converts the innermost text.
const MARK_CONTAINER_ORDER: readonly string[] = [
  'emphasis',
  'strong',
  'delete',
  'inlineCode',
];

const ATTRIBUTE_NAME = /^[A-Za-z_:][\w:.-]*$/;
const CSS_PROPERTY = /^-?[a-z][a-z0-9-]*$/;

// The persisted block-identity wrapper; compatible reads only.
const BLOCK_ID_TAG = 'block';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

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

const validateAttributes = (
  contribution: NodeMappingContribution,
  attributes: unknown,
  fail: (message: string) => never
) => {
  if (!isRecord(attributes)) {
    fail('attributes must map property keys to attribute names.');
  }
  const owned = new Set(contribution.ownedPropertyKeys);
  const names = new Set<string>();

  for (const [key, name] of Object.entries(attributes as object)) {
    if (!owned.has(key)) {
      fail(
        `attributes names "${key}", which is not a property of "${contribution.targetPlugin}".`
      );
    }
    if (typeof name !== 'string' || !ATTRIBUTE_NAME.test(name)) {
      fail(`attribute name for "${key}" must be a valid tag attribute name.`);
    }
    // An alias may not take the name another owned property is written as.
    if (
      names.has(name) ||
      (name !== key && owned.has(name) && !Object.hasOwn(attributes, name))
    ) {
      fail(`writes attribute "${String(name)}" for more than one property.`);
    }
    names.add(name);
  }
};

const validateMapping = (
  contribution: NodeMappingContribution
): ErasedMarkdownNodeMapping => {
  const { declaration, owner } = contribution;
  const fail = (message: string): never => {
    throw new Error(`Markdown node mapping "${owner}" ${message}`);
  };

  for (const field of Object.keys(declaration)) {
    if (!MARKDOWN_MAPPING_FIELDS.has(field)) {
      fail(`has unknown field "${field}".`);
    }
  }
  for (const direction of ['decode', 'encode', 'wrap'] as const) {
    if (
      declaration[direction] !== undefined &&
      typeof declaration[direction] !== 'function'
    ) {
      fail(`field "${direction}" must be a function.`);
    }
  }
  if (declaration.node !== undefined && declaration.tag !== undefined) {
    fail('must select one of "node" or "tag".');
  }
  if (declaration.node !== undefined && typeof declaration.node !== 'string') {
    fail('node must be a Markdown node kind.');
  }
  if (
    declaration.decode !== undefined &&
    declaration.node === undefined &&
    declaration.tag === undefined
  ) {
    fail('must select its decode source with "node" or "tag".');
  }
  if (declaration.tag !== undefined) validateTagName(owner, declaration.tag);
  if (declaration.nestedTags !== undefined) {
    if (
      declaration.tag === undefined ||
      !Array.isArray(declaration.nestedTags)
    ) {
      fail('can declare nestedTags only beside "tag".');
    }
    (declaration.nestedTags as unknown[]).forEach((name) =>
      validateTagName(owner, name)
    );
  }
  if (
    declaration.priority !== undefined &&
    !Number.isFinite(declaration.priority)
  ) {
    fail('priority must be finite.');
  }
  if (contribution.targetKind === 'none') {
    fail(
      `targets "${contribution.targetPlugin}", which contributes neither an element nor a mark.`
    );
  }

  if (contribution.targetKind === 'mark') {
    for (const field of ELEMENT_MAPPING_FIELDS) {
      if (declaration[field] !== undefined) {
        fail(`targets a mark; "${field}" applies only to element mappings.`);
      }
    }
    if (
      declaration.tag === undefined &&
      declaration.node === undefined &&
      declaration.wrap === undefined
    ) {
      fail('must select a "tag" or "node", or define wrap.');
    }
    if (
      declaration.node !== undefined &&
      declaration.decode === undefined &&
      !MARK_CONTAINERS.has(declaration.node as string)
    ) {
      fail(
        `can derive a mark only from strong, emphasis, delete or inlineCode; define decode for "${declaration.node as string}".`
      );
    }
    if (declaration.style !== undefined) {
      if (
        typeof declaration.style !== 'string' ||
        !CSS_PROPERTY.test(declaration.style)
      ) {
        fail('style must be a CSS property name.');
      }
      if (declaration.tag === undefined) {
        fail('can declare style only beside "tag".');
      }
      if (declaration.value !== undefined) {
        fail('cannot combine style with value; the style carries the value.');
      }
    }
  } else {
    for (const field of MARK_MAPPING_FIELDS) {
      if (declaration[field] !== undefined) {
        fail(`targets an element; "${field}" applies only to mark mappings.`);
      }
    }
    if (
      declaration.decode === undefined &&
      declaration.encode === undefined &&
      declaration.tag === undefined
    ) {
      fail('must define decode or encode, or select a "tag".');
    }
    if (declaration.attributes !== undefined) {
      if (declaration.tag === undefined) {
        fail('can declare attributes only beside "tag".');
      }
      validateAttributes(contribution, declaration.attributes, fail);
    }
  }

  return declaration;
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

const sameValue = (left: unknown, right: unknown) =>
  left === right || JSON.stringify(left) === JSON.stringify(right);

const isScriptAttribute = (tag: MarkdownTagElement, attribute: string) => {
  const value = readMarkdownTagAttributes(tag)[attribute];

  return typeof value === 'string' && isScriptUrl(value);
};

// A script URL never rendered or opened anything, so removing it is lossless
// safety cleanup, as in HTML.
const reportScriptAttribute = (
  tag: MarkdownTagElement,
  attribute: string,
  message: string,
  options: DeserializeMdContext
) =>
  options.report({
    code: 'markdown-unsafe-content',
    impact: 'lossless',
    message,
    nodeType: tag.name ?? 'tag',
    phase: 'parse',
    severity: 'warning',
    source: options.sourceLocation(tag),
  });

const reportInvalidAttribute = (
  compiled: CompiledMarkdownNodeMapping,
  tag: MarkdownTagElement,
  attribute: string,
  options: DeserializeMdContext
) =>
  isScriptAttribute(tag, attribute)
    ? reportScriptAttribute(
        tag,
        attribute,
        `Markdown attribute "${attribute}" on <${tag.name}> runs script and was removed.`,
        options
      )
    : options.report({
        code: 'markdown-property-omitted',
        key: attribute,
        message: `Markdown attribute "${attribute}" on <${tag.name}> is not a valid value and was omitted.`,
        owner: compiled.owner,
        phase: 'parse',
        reason: 'invalid',
        severity: 'warning',
        source: options.sourceLocation(tag),
      });

/**
 * The schema shape of an element target, resolved once per editor: content
 * kind from the element's content model, and the owner's own non-metadata
 * properties with their attribute names.
 */
const createNodeResolver = (
  type: string,
  ownedPropertyKeys: ReadonlySet<string>,
  aliases: ReadonlyMap<string, string>
) => {
  let resolved: NodeShape | undefined;

  return (state: SerializeMdContext['state']): NodeShape => {
    if (resolved) return resolved;
    const element =
      state.schema.element(type) ??
      failInvariant(`Markdown mapping target "${type}" has no schema element.`);
    const { inline } = element.behavior;
    const content: TagContent = element.behavior.void
      ? 'void'
      : inline
        ? 'phrasing'
        : element.content?.allowsText
          ? 'text'
          : 'flow';

    resolved = Object.freeze({
      content,
      inline,
      owned: Object.freeze(
        [...ownedPropertyKeys].flatMap((key) => {
          const property = state.schema.property({
            key,
            placement: 'element',
            type,
          });

          if (!property || property.role === 'metadata') return [];
          const descriptor = property.value as Readonly<{
            default?: unknown;
            omitDefault?: boolean;
            required?: boolean;
          }>;

          return [
            Object.freeze({
              attribute: aliases.get(key) ?? key,
              key,
              ...(Object.hasOwn(descriptor, 'default') &&
              descriptor.omitDefault !== true
                ? { materialized: Object.freeze({ value: descriptor.default }) }
                : {}),
              required: descriptor.required === true,
            }),
          ];
        })
      ),
      type,
    });

    return resolved;
  };
};

const structureKeys = new WeakMap<
  object,
  WeakMap<Descendant, ReadonlySet<string>>
>();
const NO_KEYS: ReadonlySet<string> = new Set();

/**
 * Record properties of `node` that the enclosing Markdown structure writes,
 * such as list topology, so the node's own tag does not repeat them.
 */
export const setMarkdownStructureKeys = (
  options: SerializeMdContext,
  node: Descendant,
  keys: ReadonlySet<string>
) => {
  let byNode = structureKeys.get(options.operation);

  if (!byNode) {
    byNode = new WeakMap();
    structureKeys.set(options.operation, byNode);
  }
  byNode.set(node, keys);
};

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
  options: DeserializeMdContext,
  previousSibling: MdRootContent | null
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
  previousSibling,
  readTagAttributes: (tag) => {
    const target = tag ?? (isTagNode(node) ? node : undefined);

    if (!target) return { attributes: {}, properties: {} };
    const attributes = readMarkdownTagAttributes(target);
    const shape = compiled.resolveNode?.(options.state);

    return {
      attributes,
      properties: shape
        ? decodeMarkdownNodeProperties(
            options.state,
            shape.type,
            shape.owned,
            attributes,
            (attribute) => {
              // Without a required value the mapping cannot build the node,
              // so it reports that loss itself; a script value is still
              // reported as safety cleanup.
              const required = shape.owned.some(
                (owned) => owned.attribute === attribute && owned.required
              );

              if (!required || isScriptAttribute(target, attribute)) {
                reportInvalidAttribute(compiled, target, attribute, options);
              }
            }
          )
        : {},
    };
  },
  refuse,
  report: ({ kind = 'element', ...diagnostic }) =>
    options.report({
      ...diagnostic,
      code: 'markdown-unsupported-node',
      impact: 'lossy',
      owner: compiled.owner,
      phase: 'parse',
      severity:
        kind === 'property' || options.lossPolicy === 'allow'
          ? 'warning'
          : 'error',
      source: options.sourceLocation(node),
    }),
  serializeUnknown: serializeUnknownMdxNode,
});

const createEncodeContext = (
  compiled: CompiledMarkdownNodeMapping,
  node: Descendant,
  options: SerializeMdContext,
  claimed: Set<string>,
  written = new Map<object, string>()
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
    Object.entries(properties).flatMap(([key, value]) => {
      const attributes = encodeMarkdownTagAttributes(
        options.state,
        'type' in node && typeof node.type === 'string' ? node.type : null,
        { [key]: value },
        compiled.aliases
      );

      for (const attribute of attributes) written.set(attribute, key);

      return attributes;
    }),
  encodeNodeAttributes: () => {
    const shape = compiled.resolveNode?.(options.state);

    if (!shape) return [];
    const { attributes, represented } = encodeMarkdownNodeAttributes(
      options.state,
      shape.type,
      shape.owned,
      node,
      structureKeys.get(options.operation)?.get(node) ?? NO_KEYS
    );

    for (const key of represented) claimed.add(key);

    return attributes;
  },
  isFlow: isMdFlowContent,
  isPhrasing: isMdPhrasingContent,
  node,
  preserve: (...keys: readonly string[]) => {
    for (const key of keys) {
      if (!compiled.ownedPropertyKeys.has(key)) {
        throw new Error(
          `Markdown node mapping "${compiled.owner}" cannot preserve "${key}": it is not a property of "${compiled.targetPlugin}".`
        );
      }
      claimed.add(key);
    }
  },
  preserveEmptyParagraphs: options.preserveEmptyParagraphs,
  readPlainInline: readPlainMarkdownInlineContent,
  refuse,
  report: ({ kind = 'element', ...diagnostic }) =>
    options.report({
      ...diagnostic,
      code: 'markdown-unsupported-node',
      impact: 'lossy',
      model: options.modelLocation(node),
      owner: compiled.owner,
      phase: 'serialize',
      severity:
        kind === 'property' || options.lossPolicy === 'allow'
          ? 'warning'
          : 'error',
    }),
  resourceLink: options.remarkStringifyOptions?.resourceLink === true,
});

/**
 * Run an element encoder. Claims made with `preserve` count only when the
 * encoder returns output.
 */
const createEncoder =
  (
    compiled: CompiledMarkdownNodeMapping,
    encode: (
      context: MarkdownEncodeContext,
      options: SerializeMdContext
    ) => MarkdownEncodeResult
  ): MarkdownEncoder =>
  (node, options) => {
    const claimed = new Set<string>();
    const written = new Map<object, string>();
    const encoded = encode(
      createEncodeContext(compiled, node, options, claimed, written),
      options
    );
    const refused = refusalMessage(encoded);

    if (refused !== undefined) {
      options.report({
        action: 'dropped',
        code: 'markdown-unsupported-node',
        impact: 'lossy',
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
    // `encodeAttributes` output claims its properties only where the returned
    // tree keeps it.
    if (written.size > 0) claimWrittenAttributes(encoded, written, claimed);

    return {
      claimed,
      node: encoded as MdRootContent,
      owner: compiled.owner,
    };
  };

const claimWrittenAttributes = (
  node: unknown,
  written: ReadonlyMap<object, string>,
  claimed: Set<string>
) => {
  if (!node || typeof node !== 'object') return;
  const { attributes, children } = node as {
    attributes?: unknown;
    children?: unknown;
  };

  if (Array.isArray(attributes)) {
    for (const attribute of attributes) {
      const key = written.get(attribute);

      if (key !== undefined) claimed.add(key);
    }
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      claimWrittenAttributes(child, written, claimed);
    }
  }
};

const nodeShape = (
  compiled: CompiledMarkdownNodeMapping,
  state: SerializeMdContext['state']
) =>
  compiled.resolveNode?.(state) ??
  failInvariant('Expected an element mapping.');

/** What a removed callback-less tag leaves behind: its content, if any. */
const decodeDerivedTagContent = (
  tag: MarkdownTagElement,
  content: TagContent,
  marks: MdMarks,
  options: DeserializeMdContext
): Descendant[] => {
  if (content === 'void' || tag.children.length === 0) return [];
  const children = convertChildrenDeserialize(tag.children, marks, options);

  if (content !== 'text') return children;
  const text = toMarkdownCaptionContent(options, children);

  return text && readPlainMarkdownInlineContent(text) !== ''
    ? [
        {
          children: [...text],
          type: options.registry.type(PLUGINS.paragraph) ?? 'paragraph',
        },
      ]
    : [];
};

/** Build a callback-less tag's element from its attributes and content. */
const decodeDerivedTag =
  (compiled: CompiledMarkdownNodeMapping): MarkdownDecoder['decode'] =>
  (node, marks, options) => {
    const tag = node as MarkdownTagElement;
    const { content, owned, type } = nodeShape(compiled, options.state);
    const invalid: string[] = [];
    const properties = decodeMarkdownNodeProperties(
      options.state,
      type,
      owned,
      readMarkdownTagAttributes(tag),
      (attribute) => invalid.push(attribute)
    );
    const missing = owned.find(
      ({ key, required }) => required && !Object.hasOwn(properties, key)
    );

    if (missing && invalid.includes(missing.attribute)) {
      // An unusable required value, such as an unsafe `src`, removes the
      // element but not what it contains.
      if (isScriptAttribute(tag, missing.attribute)) {
        reportScriptAttribute(
          tag,
          missing.attribute,
          `<${tag.name}> has a script "${missing.attribute}" value; the element was removed and its content kept.`,
          options
        );
      } else {
        options.report({
          action: 'unwrapped',
          code: 'markdown-unsupported-node',
          impact: 'lossy',
          message: `<${tag.name}> has an invalid "${missing.attribute}" value; the element was removed and its content kept.`,
          nodeType: tag.name ?? type,
          owner: compiled.owner,
          phase: 'parse',
          severity: options.lossPolicy === 'allow' ? 'warning' : 'error',
          source: options.sourceLocation(tag),
        });
      }

      return decodeDerivedTagContent(tag, content, marks, options);
    }
    if (missing) {
      return refuse(
        `<${tag.name}> requires the "${missing.attribute}" attribute.`
      );
    }
    for (const attribute of invalid) {
      reportInvalidAttribute(compiled, tag, attribute, options);
    }
    for (const { key, materialized } of owned) {
      if (materialized && !Object.hasOwn(properties, key)) {
        properties[key] = materialized.value;
      }
    }
    if (content === 'void') {
      return tag.children.length > 0
        ? refuse(`<${tag.name}> cannot have content.`)
        : { ...properties, children: [{ text: '' }], type };
    }
    const children = convertChildrenDeserialize(tag.children, marks, options);

    if (content !== 'text') return { ...properties, children, type };
    const text = toMarkdownCaptionContent(options, children);

    return text
      ? { ...properties, children: [...text], type }
      : refuse(`<${tag.name}> content must be one Markdown paragraph.`);
  };

/** Write a callback-less tag: node attributes, content by the content model. */
const encodeDerivedTag =
  (compiled: CompiledMarkdownNodeMapping) =>
  (
    context: MarkdownEncodeContext,
    options: SerializeMdContext
  ): MdRootContent => {
    const name = compiled.mapping.tag ?? failInvariant('Expected a tag.');
    const { content, inline } = nodeShape(compiled, options.state);
    const { node } = context;
    const children = ElementApi.isElement(node) ? node.children : [];
    const attributes = context.encodeNodeAttributes();

    if (inline) {
      return {
        attributes,
        children: content === 'void' ? [] : context.encodePhrasing(children),
        name,
        type: 'mdxJsxTextElement',
      };
    }

    return {
      attributes,
      children:
        content === 'void'
          ? []
          : content === 'flow'
            ? context.encodeFlow(children)
            : context.readPlainInline(children) === ''
              ? []
              : [
                  {
                    children: context.encodePhrasing(children),
                    type: 'paragraph',
                  },
                ],
      name,
      type: 'mdxJsxFlowElement',
    };
  };

/** Run a mark's custom `wrap`; a refusal omits the mark, never the text. */
const createMarkWrapper =
  (
    compiled: CompiledMarkdownNodeMapping,
    wrap: NonNullable<ErasedMarkdownNodeMapping['wrap']>
  ): MarkdownMarkEncoder =>
  (node, options) => {
    const key =
      compiled.targetKey ?? failInvariant('Expected a mark target key.');
    const wrapper = wrap({
      ...createEncodeContext(compiled, node, options, new Set()),
      value: (node as Readonly<Record<string, unknown>>)[key],
    });
    const refused = refusalMessage(wrapper);

    if (refused !== undefined) {
      options.report({
        code: 'markdown-property-omitted',
        key,
        message: refused,
        model: { ...options.modelLocation(node), property: key },
        owner: compiled.owner,
        phase: 'serialize',
        reason: 'unsupported',
        severity: 'warning',
      });

      return undefined;
    }
    if (!wrapper) {
      throw new Error(
        `Markdown node mapping "${compiled.owner}" returned no mark wrapper.`
      );
    }

    return { ...wrapper, children: [] } as MdRootContent;
  };

const createTagWrapper =
  (name: string, key: string, style?: string): MarkdownMarkEncoder =>
  (node) => ({
    attributes: style
      ? [
          {
            name: 'style',
            type: 'mdxJsxAttribute',
            value: `${style}: ${String((node as Readonly<Record<string, unknown>>)[key])};`,
          },
        ]
      : [],
    children: [],
    name,
    type: 'mdxJsxTextElement',
  });

const isPresent = (value: unknown) =>
  value !== undefined && value !== null && value !== false;

const createMarkWriter = (
  compiled: CompiledMarkdownNodeMapping
): MarkdownMarkWriter | undefined => {
  const { mapping } = compiled;
  const key =
    compiled.targetKey ?? failInvariant('Expected a mark target key.');
  const accepts = (value: unknown) => sameValue(value, mapping.value ?? true);

  if (mapping.wrap) {
    return {
      accepts:
        mapping.value === undefined
          ? isPresent
          : (value) => sameValue(value, mapping.value),
      kind: 'wrap',
      wrap: createMarkWrapper(compiled, mapping.wrap),
    };
  }
  if (mapping.node !== undefined) {
    return MARK_CONTAINERS.has(mapping.node)
      ? {
          accepts,
          kind: mapping.node as MarkdownMarkWriter['kind'],
        }
      : undefined;
  }
  if (mapping.tag === undefined) return undefined;

  return {
    accepts: mapping.style
      ? (value) => typeof value === 'string' && value !== ''
      : accepts,
    kind: 'wrap',
    wrap: createTagWrapper(mapping.tag, key, mapping.style),
  };
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
    .map((contribution): CompiledMarkdownNodeMapping => {
      const mapping = validateMapping(contribution);
      const aliases = new Map(Object.entries(mapping.attributes ?? {}));
      const ownedPropertyKeys = new Set(contribution.ownedPropertyKeys);
      const mark = contribution.targetKind === 'mark';

      return Object.freeze({
        aliases,
        getFormatContext,
        mapping,
        owner: contribution.owner,
        ownedPropertyKeys,
        plugin: contribution.ownerPlugin,
        resolveNode:
          mark || !contribution.targetType
            ? null
            : createNodeResolver(
                contribution.targetType,
                ownedPropertyKeys,
                aliases
              ),
        targetKey: mark ? contribution.targetKey : null,
        targetPlugin: contribution.targetPlugin,
        targetType: contribution.targetType,
      });
    })
    .sort(compareMappings);
  const model = getCompiledPlateModel(editor);
  const decodeByNode = new Map<string, MarkdownDecoder[]>();
  const decodeByTag = new Map<string, MarkdownDecoder[]>();
  const encodeByType = new Map<string, MarkdownEncoder>();
  const markWriters = new Map<string, MarkdownMarkWriter[]>();
  const tags = new Map<string, MarkdownTagKind>([[BLOCK_ID_TAG, 'block']]);
  const tagKind = (compiled: CompiledMarkdownNodeMapping): MarkdownTagKind => {
    // Marks have no element type: text-level.
    if (!compiled.targetType) return 'inline';
    const element = model.contribution.elements?.[compiled.targetType] as
      | Readonly<{ inline?: boolean; void?: unknown }>
      | undefined;

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

  const pushDecoder = (
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
  const addDecoder = (
    compiled: CompiledMarkdownNodeMapping,
    decode: MarkdownDecoder['decode']
  ) => {
    const { mapping } = compiled;

    pushDecoder(
      mapping.tag === undefined ? decodeByNode : decodeByTag,
      mapping.tag ?? mapping.node ?? failInvariant('Expected a selector.'),
      Object.freeze({
        decode,
        mark: compiled.targetKey !== null,
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
  };

  const addElement = (compiled: CompiledMarkdownNodeMapping) => {
    const { mapping } = compiled;
    const type =
      compiled.targetType ?? failInvariant('Expected an element target.');
    const derived = !mapping.decode && !mapping.encode;
    const { decode, encode } = mapping;

    if (decode) {
      addDecoder(compiled, (node, marks, options, previousSibling) =>
        decode(
          createDecodeContext(compiled, node, marks, options, previousSibling)
        )
      );
    } else if (derived) {
      addDecoder(compiled, decodeDerivedTag(compiled));
    }
    const encoder = encode
      ? (context: MarkdownEncodeContext) => encode(context)
      : derived
        ? encodeDerivedTag(compiled)
        : undefined;

    if (!encoder) return;
    if (encodeByType.has(type)) {
      throw new Error(
        `Markdown node mappings must declare one encoder for target "${compiled.targetPlugin}".`
      );
    }
    encodeByType.set(type, createEncoder(compiled, encoder));
  };

  const addMark = (compiled: CompiledMarkdownNodeMapping) => {
    const { mapping } = compiled;
    const key =
      compiled.targetKey ?? failInvariant('Expected a mark target key.');
    const { decode, style } = mapping;

    if (mapping.tag !== undefined || mapping.node !== undefined) {
      addDecoder(
        compiled,
        decode
          ? (node, marks, options, previousSibling) =>
              decode(
                createDecodeContext(
                  compiled,
                  node,
                  marks,
                  options,
                  previousSibling
                )
              )
          : style
            ? (node) =>
                readMarkdownStyleValue(node as MarkdownTagElement, style)
            : () => mapping.value ?? true
      );
    }
    const writer = createMarkWriter(compiled);

    if (writer) markWriters.set(key, [...(markWriters.get(key) ?? []), writer]);
  };

  contributions.forEach((compiled) =>
    compiled.targetKey === null ? addElement(compiled) : addMark(compiled)
  );

  for (const [kind, decode] of Object.entries(markdownIntrinsicDecoders)) {
    pushDecoder(
      decodeByNode,
      kind,
      intrinsicDecoder(decode as MarkdownDecoder['decode'])
    );
  }

  const containerRank = (key: string) => {
    const index = MARK_CONTAINER_ORDER.indexOf(
      markWriters.get(key)?.[0]?.kind ?? 'wrap'
    );

    return index === -1 ? MARK_CONTAINER_ORDER.length : index;
  };
  const freeze = <T>(map: Map<string, T[]>) =>
    new Map(
      [...map.entries()].map(([source, entries]) => [
        source,
        Object.freeze(entries),
      ])
    );
  const compiled = Object.freeze({
    decodeByNode: freeze(decodeByNode),
    decodeByTag: freeze(decodeByTag),
    encodeByType,
    // Stable sort keeps declaration order within a rank.
    markOrder: Object.freeze(
      [...markWriters.keys()].sort(
        (left, right) => containerRank(left) - containerRank(right)
      )
    ),
    markWriters: freeze(markWriters),
    tags,
  });

  compiledMarkdownMappingsCache.set(editor, compiled);

  return compiled;
};

/** The first writer of `key` that represents `value`, if any. */
export const getMarkdownMarkWriter = (
  mappings: CompiledMarkdownMappings,
  key: string,
  value: unknown
) => mappings.markWriters.get(key)?.find((writer) => writer.accepts(value));

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
  options: DeserializeMdContext,
  previousSibling: MdRootContent | null = null
): Descendant[] | undefined => {
  if (decoders[0]?.mark) {
    let marked: MdMarks | undefined;

    for (const decoder of decoders) {
      const contribution = decoder.decode(
        node,
        marks,
        options,
        previousSibling
      );

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
    const decoded = decoder.decode(node, marks, options, previousSibling);
    const refused = refusalMessage(decoded);

    if (refused !== undefined) {
      options.report({
        action: isTagNode(node) ? 'replaced' : 'dropped',
        code: 'markdown-unsupported-node',
        impact: 'lossy',
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
