import type { Node as UnistNode } from 'unist';

import {
  type Editor,
  type MarkdownDecodeContext,
  type MarkdownEncodeContext,
  getPlateNodeCodecContributions,
  type PlateNodeCodecContribution,
  type Descendant,
} from '../../../core';
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

type ErasedMarkdownNodeCodec = Readonly<{
  decode?: BivariantCallback<
    [MarkdownDecodeContext],
    Descendant | Descendant[] | undefined
  >;
  encode?: BivariantCallback<
    [MarkdownEncodeContext],
    MdRootContent | undefined
  >;
  from?: string;
  kind: 'node';
  mark?: boolean;
  priority?: number;
}>;

type CompiledMarkdownNodeCodec = Readonly<{
  codec: ErasedMarkdownNodeCodec;
  owner: string;
  schema: PlateNodeCodecContribution['schema'];
  targetKey: string | null;
  targetPlugin: string;
  targetType: string | null;
}>;

export type CompiledMarkdownCodecs = Readonly<{
  decodeBySource: ReadonlyMap<string, readonly CompiledMarkdownNodeCodec[]>;
  rules: MdRules;
}>;

const MARKDOWN_CODEC_FIELDS = new Set([
  'decode',
  'encode',
  'from',
  'kind',
  'mark',
  'priority',
]);
const compiledMarkdownCodecsCache = new WeakMap<
  object,
  CompiledMarkdownCodecs
>();

const compareCodecs = (
  left: CompiledMarkdownNodeCodec,
  right: CompiledMarkdownNodeCodec
) =>
  (right.codec.priority ?? 0) - (left.codec.priority ?? 0) ||
  left.owner.localeCompare(right.owner) ||
  left.targetPlugin.localeCompare(right.targetPlugin);

const validateCodec = (
  owner: string,
  declaration: Readonly<Record<string, unknown>>
): ErasedMarkdownNodeCodec => {
  for (const field of Object.keys(declaration)) {
    if (!MARKDOWN_CODEC_FIELDS.has(field)) {
      throw new Error(
        `Markdown node codec "${owner}" has unknown field "${field}".`
      );
    }
  }
  if (declaration.kind !== 'node') {
    throw new Error(`Markdown node codec "${owner}" must use kind "node".`);
  }
  if (!declaration.decode && !declaration.encode) {
    throw new Error(
      `Markdown node codec "${owner}" must define decode or encode.`
    );
  }
  for (const direction of ['decode', 'encode'] as const) {
    if (
      declaration[direction] !== undefined &&
      typeof declaration[direction] !== 'function'
    ) {
      throw new Error(
        `Markdown node codec "${owner}" field "${direction}" must be a function.`
      );
    }
  }
  if (
    declaration.decode !== undefined &&
    typeof declaration.from !== 'string'
  ) {
    throw new Error(
      `Markdown node codec "${owner}" must name its decode source with "from".`
    );
  }
  if (
    declaration.priority !== undefined &&
    !Number.isFinite(declaration.priority)
  ) {
    throw new Error(`Markdown node codec "${owner}" priority must be finite.`);
  }

  return declaration as ErasedMarkdownNodeCodec;
};

const createCommonContext = (
  options: DeserializeMdContext | SerializeMdContext
) => ({
  isBlock: options.isBlock,
  isInline: options.isInline,
  registry: options.registry,
});

const createDecodeContext = (
  compiled: CompiledMarkdownNodeCodec,
  node: UnistNode,
  decoration: MdDecoration,
  options: DeserializeMdContext,
  decode = (
    children: readonly MdRootContent[],
    nextDecoration: MdDecoration = decoration
  ) => convertChildrenDeserialize([...children], nextDecoration, options)
): MarkdownDecodeContext => ({
  ...createCommonContext(options),
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
  schema: compiled.schema,
  serializeUnknown: serializeUnknownMdxNode,
  splitLineBreaks: options.splitLineBreaks,
});

const createEncodeContext = (
  compiled: CompiledMarkdownNodeCodec,
  node: Descendant,
  options: SerializeMdContext
): MarkdownEncodeContext => ({
  ...createCommonContext(options),
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
        `Markdown node codec "${compiled.owner}" expected block content.`
      );
    }

    return encoded;
  },
  encodeFlow: (children) => {
    const encoded = convertNodesSerialize(children, options);

    if (!encoded.every(isMdFlowContent)) {
      throw new Error(
        `Markdown node codec "${compiled.owner}" expected flow content.`
      );
    }

    return encoded;
  },
  encodePhrasing: (children) => {
    const encoded = convertNodesSerialize(children, options);

    if (!encoded.every(isMdPhrasingContent)) {
      throw new Error(
        `Markdown node codec "${compiled.owner}" expected inline content.`
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
  resourceLink: options.remarkStringifyOptions?.resourceLink === true,
  schema: compiled.schema,
});

const createRule = (compiled: CompiledMarkdownNodeCodec): MdNodeParser => ({
  ...(compiled.codec.mark === undefined ? {} : { mark: compiled.codec.mark }),
  ...(compiled.codec.decode
    ? {
        deserialize: (node, decoration, options) =>
          (
            compiled.codec.decode ??
            failInvariant('Expected value to be defined')
          )(createDecodeContext(compiled, node, decoration, options)),
      }
    : {}),
  ...(compiled.codec.encode
    ? {
        serialize: (node, options) => {
          const encoded = (
            compiled.codec.encode ??
            failInvariant('Expected value to be defined')
          )(createEncodeContext(compiled, node, options));

          if (!encoded) {
            throw new Error(
              `Markdown node codec "${compiled.owner}" returned no encoded node.`
            );
          }

          return encoded;
        },
      }
    : {}),
});

export const compileMarkdownCodecs = (
  editor: Editor
): CompiledMarkdownCodecs => {
  const cached = compiledMarkdownCodecsCache.get(editor);

  if (cached) return cached;

  const contributions = getPlateNodeCodecContributions(editor, 'text/markdown')
    .map((contribution): CompiledMarkdownNodeCodec =>
      Object.freeze({
        codec: validateCodec(contribution.owner, contribution.declaration),
        owner: contribution.owner,
        schema: contribution.schema,
        targetKey: contribution.targetKey,
        targetPlugin: contribution.targetPlugin,
        targetType: contribution.targetType,
      })
    )
    .sort(compareCodecs);
  const decodeBySource = new Map<string, CompiledMarkdownNodeCodec[]>();
  const rules: MdRules = {};

  contributions.forEach((compiled) => {
    if (compiled.codec.decode) {
      const source =
        compiled.codec.from ?? failInvariant('Expected value to be defined');
      const sourceCodecs = decodeBySource.get(source) ?? [];
      const duplicate = sourceCodecs.find(
        (candidate) =>
          candidate.targetPlugin === compiled.targetPlugin &&
          (candidate.codec.priority ?? 0) === (compiled.codec.priority ?? 0)
      );

      if (duplicate) {
        throw new Error(
          `Markdown node codecs "${duplicate.owner}" and "${compiled.owner}" have equal-priority decode claims for "${source}" and target "${compiled.targetPlugin}".`
        );
      }

      sourceCodecs.push(compiled);
      decodeBySource.set(source, sourceCodecs);
    }
    if (compiled.codec.encode || compiled.codec.mark) {
      const documentIdentity =
        compiled.targetType ??
        compiled.targetKey ??
        failInvariant('Expected value to be defined');

      if (rules[documentIdentity]) {
        throw new Error(
          `Markdown node codecs must declare one encoder/mark owner for target "${compiled.targetPlugin}".`
        );
      }
      rules[documentIdentity] = createRule(compiled);
    }
  });

  const compiled = Object.freeze({
    decodeBySource: new Map(
      [...decodeBySource.entries()].map(([source, codecs]) => [
        source,
        Object.freeze(codecs),
      ])
    ),
    rules: Object.freeze(rules),
  });

  compiledMarkdownCodecsCache.set(editor, compiled);

  return compiled;
};

export const runMarkdownDecodeCodecs = (
  compiled: CompiledMarkdownCodecs,
  source: string,
  node: UnistNode,
  decoration: MdDecoration,
  options: DeserializeMdContext,
  override?: (pluginName: string) => Descendant[] | undefined
) => {
  const codecs = compiled.decodeBySource.get(source) ?? [];
  const sourceChildren =
    'children' in node && Array.isArray(node.children)
      ? node.children
      : undefined;
  const run = (
    index: number,
    nextDecoration: MdDecoration,
    decodeChildren = false
  ) => {
    const codec = codecs[index];

    if (!codec) {
      return decodeChildren && sourceChildren
        ? convertChildrenDeserialize(
            sourceChildren as MdRootContent[],
            nextDecoration,
            options
          )
        : undefined;
    }

    const overridden = override?.(codec.targetPlugin);

    if (overridden !== undefined) return overridden;

    const decoded = (
      codec.codec.decode ?? failInvariant('Expected value to be defined')
    )(
      createDecodeContext(
        codec,
        node,
        nextDecoration,
        options,
        (children, childDecoration = nextDecoration) => {
          if (!codec.codec.mark || children !== sourceChildren) {
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
